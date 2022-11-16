// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDexLinker.sol";
import "./interfaces/IFeeCalculator.sol";
import "./interfaces/IProxy.sol";
import "./interfaces/IWETH.sol";

contract Proxy is IProxy, Ownable {
    receive() payable external {}

    using SafeERC20 for IERC20;

    address private _wETH;
    address private _feeCal;
    address private _liquidity;
    mapping(address => bool) private _mpc;

    // minimum timeout duration in cross-chain swap
    uint256 public override minimumTimeout;

    uint64 public _aggregateIndex;
    mapping(uint64 => AggData) public override aggregates;
    mapping(uint64 => address) public override linkers;

    struct AggState {
        uint256 totalAggSrcAmount;
        uint256 totalLocalDesAmount;
        uint256 leftETH;
    }

    constructor(address mpc, address wETH) {
        _mpc[mpc] = true;
        _wETH = wETH;

        emit AddMpc(mpc);
    }

    function feeCalculator() external override view returns (address) {
        return _feeCal;
    }

    function liquidity() external override view returns (address) {
        return _liquidity;
    }

    function mpc(address mpcAddr) external override view returns (bool) {
        return _mpc[mpcAddr];
    }

    function transferTo(address token, address to, uint256 amount) internal {
        if (token == _wETH) {
            IWETH(_wETH).transfer(to, amount);
        } else {
            IERC20(token).safeTransferFrom(msg.sender, to, amount);
        }
    }

    function transferIn(address token, uint256 amount) internal {
        if (token != _wETH) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
    }

    function transferOut(address token, address to, uint256 amount) internal {
        if (token == _wETH) {
            IWETH(_wETH).withdraw(amount);
            to.call{value: amount}(new bytes(0));
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    function checkETH(uint256 leftETH, uint256 used) internal returns (uint256) {
        require(leftETH >= used, "out of ETH");
        return leftETH - used;
    }

    function singleDex(address srcToken, address desToken, address route, uint64 dexID, uint256 amount) internal returns (uint256) {
        address dexLinker = linkers[dexID];
        require(dexLinker != address(0), "linker error");
        transferTo(srcToken, dexLinker, amount);
        // temporarily put des tokens in the proxy contract
        return IDexLinker(dexLinker).swap(srcToken, desToken, route, amount);
    }

    function singleDex2(address srcToken, address desToken, address route, uint64 dexID, uint256 amount) internal returns (uint256) {
        address dexLinker = linkers[dexID];
        require(dexLinker != address(0), "linker error");
        IERC20(srcToken).safeTransferFrom(_liquidity, dexLinker, amount);
        return IDexLinker(dexLinker).swap(srcToken, desToken, route, amount);
    }

    function multiDex(address srcToken, address desToken, address route, uint64[] calldata dexIDs, uint256 amount) internal returns (uint256) {

        address dexLinker = linkers[dexIDs[0]];
        require(dexLinker != address(0), "linker error");
        transferTo(srcToken, dexLinker, amount);
        uint256 middleAmount = IDexLinker(dexLinker).swap(srcToken, route, address(0), amount);

        dexLinker = linkers[dexIDs[1]];
        require(dexLinker != address(0), "linker error2");
        IERC20(route).safeTransfer(dexLinker, middleAmount);
        return IDexLinker(dexLinker).swap(route, desToken, address(0), middleAmount);
    }

    function multiDex2(address srcToken, address desToken, address route, uint64[] calldata dexIDs, uint256 amount) internal returns (uint256) {

        address dexLinker = linkers[dexIDs[0]];
        require(dexLinker != address(0), "linker error");
        IERC20(srcToken).safeTransferFrom(_liquidity, dexLinker, amount);
        uint256 middleAmount = IDexLinker(dexLinker).swap(srcToken, route, address(0), amount);

        dexLinker = linkers[dexIDs[1]];
        require(dexLinker != address(0), "linker error2");
        IERC20(route).safeTransfer(dexLinker, middleAmount);
        return IDexLinker(dexLinker).swap(route, desToken, address(0), middleAmount);
    }

    function aggregateEntry(AggregateEntryParams calldata params) external override payable {

        require(params.dexIDs.length != 0, "empty array");
        require(params.dexIDs.length == params.routes.length && params.dexIDs.length == params.amounts.length, "array error");
        require(params.deadline >= minimumTimeout + block.timestamp, "timeout error");

        AggState memory aggState;

        if (msg.value > 0) {
            IWETH(_wETH).deposit{value: msg.value}();
            aggState.leftETH = msg.value;
        }

        for (uint i = 0; i < params.dexIDs.length; i++) {

            if (params.srcToken == _wETH) {
                aggState.leftETH = checkETH(aggState.leftETH, params.amounts[i]);
            }

            require(params.dexIDs[i].length >= 1 && params.dexIDs[i].length <= 2, "dexIDs error");

            if (linkers[params.dexIDs[i][0]] == address(0)) {
                // cross chain
                aggState.totalAggSrcAmount += params.amounts[i];
            } else if (params.dexIDs[i].length == 1) {
                // in source chain, directly swap
                aggState.totalLocalDesAmount += singleDex(params.srcToken, params.desToken, params.routes[i], params.dexIDs[i][0], params.amounts[i]);
            } else {
                // in source chain, multi dex
                aggState.totalLocalDesAmount += multiDex(params.srcToken, params.desToken, params.routes[i], params.dexIDs[i], params.amounts[i]);
            }
        }

        if (aggState.totalAggSrcAmount > 0) {
            // charge
            uint256 fee = IFeeCalculator(_feeCal).calFee(abi.encode(params.srcToken, params.dexIDs, params.routes, params.feeMode));

            // 0: srcToken; 1: source token
            if (params.feeMode == 0 && params.srcToken != _wETH ) {
                transferTo(params.srcToken, _liquidity, fee);
            } else {
                aggState.leftETH = checkETH(aggState.leftETH, fee);
                transferTo(_wETH, _liquidity, fee);
            }

            // srcToken is placed in this contract and processed together when finished
            transferIn(params.srcToken, aggState.totalAggSrcAmount);

            _aggregateIndex++;
            aggregates[_aggregateIndex] = AggData(
                msg.sender,
                params.srcToken,
                params.desToken,
                aggState.totalAggSrcAmount,
                aggState.totalLocalDesAmount,
                params.deadline
            );
            emit AggregateExec(_aggregateIndex, params.deadline, msg.sender, params.srcToken, params.desToken,
                aggState.totalLocalDesAmount, params.dexIDs, params.routes, params.amounts);

        } else {
            transferOut(params.desToken, msg.sender, aggState.totalLocalDesAmount);
            emit AggregateExecLocal(msg.sender, params.srcToken, params.desToken, params.dexIDs,
                params.routes, params.amounts, aggState.totalLocalDesAmount);
        }

        if (aggState.leftETH > 0) {
            transferOut(_wETH, msg.sender, aggState.leftETH);
        }
    }

    function swapEntry(SwapEntryParams calldata params) external override onlyMPC {
        require(params.dexIDs.length != 0, "empty array");
        require(params.dexIDs.length == params.amounts.length && params.dexIDs.length == params.routes.length, "array error");

        uint256 totalDesAmount;

        for (uint i = 0; i < params.dexIDs.length; i++) {
            require(params.dexIDs[i].length >= 1 && params.dexIDs[i].length <= 2, "dexIDs error");

            if (params.dexIDs[i].length == 1) {
                totalDesAmount += singleDex2(params.srcToken, params.desToken, params.routes[i], params.dexIDs[i][0], params.amounts[i]);
            } else {
                totalDesAmount += multiDex2(params.srcToken, params.desToken, params.routes[i], params.dexIDs[i], params.amounts[i]);
            }
        }

        IERC20(params.desToken).safeTransfer(_liquidity, totalDesAmount);

        emit SwapEntry(params.txHash, params.srcToken, params.desToken, params.dexIDs, params.amounts, totalDesAmount);
    }

    function finish(uint64 aggregateID, uint256 srcAmount, uint256 desAmount) external override onlyMPC {

        AggData memory aggData = aggregates[aggregateID];
        require(aggData.user != address(0), "agg id err");
        require(srcAmount <= aggData.totalAggSrcAmount, "src amount err");

        // The remaining source tokens are returned to the user
        if (aggData.totalAggSrcAmount > srcAmount) {
            transferOut(aggData.srcToken, aggData.user, aggData.totalAggSrcAmount - srcAmount);
        }

        if (aggData.totalLocalDesAmount > 0) {
            transferOut(aggData.desToken, aggData.user, aggData.totalLocalDesAmount);
        }

        // The src token used for the exchange is transferred to the liquidity contract
        if (srcAmount > 0) {
            IERC20(aggData.srcToken).safeTransfer(_liquidity, srcAmount);
        }

        // The redeemed des token is transferred to the user
        if (desAmount > 0) {
            IERC20(aggData.desToken).safeTransferFrom(_liquidity, aggData.user, desAmount);
        }

        delete aggregates[aggregateID];
        emit Finish(aggregateID, srcAmount, desAmount);
    }

    function withdraw(uint64 aggregateID) external override {
        AggData memory aggData = aggregates[aggregateID];
        require(aggData.user == msg.sender, "user not match");
        require(block.timestamp > aggData.timeout, "withdraw error");

        transferOut(aggData.srcToken, msg.sender, aggData.totalAggSrcAmount);
        transferOut(aggData.desToken, msg.sender, aggData.totalLocalDesAmount);

        delete aggregates[aggregateID];
        emit Withdraw(aggregateID);
    }

    function addDexLinker(uint64 dexID, address dexLinker) external override onlyOwner {
        require(linkers[dexID] == address(0), "dex ID exists");

        linkers[dexID] = dexLinker;
        emit AddDexLinker(dexID, dexLinker);
    }

    function removeDexLinker(uint64 dexID) external override onlyOwner {
        delete linkers[dexID];
        emit RemoveDexLinker(dexID);
    }

    function _addPair(uint64[] calldata dexIDs, address token0, address token1) internal {
        for (uint i = 0; i < dexIDs.length; i++) {
            address dexLinker = linkers[dexIDs[i]];
            require(dexLinker != address(0), "dex linker not found");

            IDexLinker(dexLinker).addPair(token0, token1);
        }

        emit AddPair(dexIDs, token0, token1);
    }

    function _removePair(uint64[] calldata dexIDs, address token0, address token1) internal {
        for (uint i = 0; i < dexIDs.length; i++) {
            address dexLinker = linkers[dexIDs[i]];
            require(dexLinker != address(0), "dex linker not found");

            IDexLinker(dexLinker).removePair(token0, token1);
        }

        emit RemovePair(dexIDs, token0, token1);
    }

    function addPair(uint64[] calldata dexIDs, address token0, address token1) external override onlyOwner {
        _addPair(dexIDs, token0, token1);
    }

    function removePair(uint64[] calldata dexIDs, address token0, address token1) external override onlyOwner {
        _removePair(dexIDs, token0, token1);
    }

    function addPairBatch(PairInfo[] calldata pairs) external override onlyOwner {
        for (uint i=0; i<pairs.length; i++) {
            _addPair(pairs[i].dexIDs, pairs[i].token0, pairs[i].token1);
        }
    }

    function removePairBatch(PairInfo[] calldata pairs) external override onlyOwner {
        for (uint i=0; i<pairs.length; i++) {
            _removePair(pairs[i].dexIDs, pairs[i].token0, pairs[i].token1);
        }
    }

    function changeLiquidity(address liquidity) external override onlyOwner {
        _liquidity = liquidity;
        emit ChangeLiquidity(liquidity);
    }

    function changeFeeCalculator(address feeCal) external override onlyOwner {
        _feeCal = feeCal;
        emit ChangeFeeCalculator(feeCal);
    }

    function setMinimumTimeout(uint256 _minimumTimeout) external override onlyOwner {
        minimumTimeout = _minimumTimeout;
        emit SetMinimumTimeout(_minimumTimeout);
    }

    function addMpc(address mpc) external override onlyOwner {
        _mpc[mpc] = true;
        emit AddMpc(mpc);
    }

    function removeMpc(address mpc) external override onlyOwner {
        delete _mpc[mpc];
        emit RemoveMpc(mpc);
    }

    modifier onlyMPC() {
        require(_mpc[msg.sender], "caller is not the mpc");
        _;
    }

}
