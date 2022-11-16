// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

import "@chainlink/contracts/src/v0.5/interfaces/AggregatorV2V3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IFeeCalculator.sol";

contract FeeCalculator is IFeeCalculator, Ownable {

    uint64 public _chain;
    uint256 public override finishFee;
    mapping(uint64 => uint256) public override dex2fee;
    mapping(uint64 => address) public override chain2oracle;
    mapping(address => address) public override token2oracle;

    constructor(uint64 chain) {
        _chain = chain;
    }

    struct CalFeeState {
        uint256 fee;
        uint256 basePrice;
        uint8 baseDecimals;
    }

    function calFee(bytes calldata data) external override view returns (uint256) {
        (address srcToken, uint64[][] memory dexIDs, address[] memory routes, uint8 feeMode) =
            abi.decode(data, (address, uint64[][], address[], uint8));

        CalFeeState memory calFeeState;

        // 0: srcToken; 1: source token
        if (feeMode == 0) {
            calFeeState.basePrice = _token2UPrice(srcToken);
            calFeeState.baseDecimals = ERC20(srcToken).decimals();
        } else {
            calFeeState.basePrice = _chainToken2UPrice(_chain);
            calFeeState.baseDecimals = 18;
        }

        for (uint i = 0; i < dexIDs.length; i++) {
            // cross chain
            if (_dex2chain(dexIDs[i][0]) != _chain) {
                calFeeState.fee += _chainToken2UPrice(_dex2chain(dexIDs[i][0])) * dex2fee[dexIDs[i][0]] / calFeeState.basePrice;

                if (dexIDs[i].length == 1 && routes[i] != address(0)) {
                    calFeeState.fee += _chainToken2UPrice(_dex2chain(dexIDs[i][0])) * dex2fee[dexIDs[i][0]] / calFeeState.basePrice;
                }

                if (dexIDs[i].length == 2) {
                    calFeeState.fee += _chainToken2UPrice(_dex2chain(dexIDs[i][1])) * dex2fee[dexIDs[i][1]] / calFeeState.basePrice;
                }
            }
        }

        // source chain finish fee
        calFeeState.fee += _chainToken2UPrice(_chain) * finishFee / calFeeState.basePrice;
        return calFeeState.fee / (10 ** (18-calFeeState.baseDecimals));
    }

    function dex2chain(uint64 dexID) external override view returns (uint64) {
        return _dex2chain(dexID);
    }

    function _dex2chain(uint64 dexID) internal view returns (uint64) {
        return dexID / 100000;
    }

    function token2UPrice(address token) external override view returns (uint256) {
        return _token2UPrice(token);
    }

    function _token2UPrice(address token) internal view returns (uint256) {
        address oracle = token2oracle[token];

        uint256 price = uint256(AggregatorV2V3Interface(oracle).latestAnswer());
        uint256 decimals = uint256(AggregatorV2V3Interface(oracle).decimals());

        return price * (10 ** (18 - decimals));
    }

    function chainToken2UPrice(uint64 chainID) external override view returns (uint256) {
        return _chainToken2UPrice(chainID);
    }

    function _chainToken2UPrice(uint64 chainID) internal view returns (uint256) {
        address oracle = chain2oracle[chainID];

        uint256 price = uint256(AggregatorV2V3Interface(oracle).latestAnswer());
        uint256 decimals = uint256(AggregatorV2V3Interface(oracle).decimals());

        return price * (10 ** (18 - decimals));
    }

    // finish fee = finish gas * gas price (in source token with 18 decimals)
    function setFinishFee(uint256 _finishFee) external override onlyOwner {
        finishFee = _finishFee;
        emit SetFinishFee(_finishFee);
    }

    // dex fee = dex gas * gas price (in source token with 18 decimals)
    function setDex2fee(uint64 dexID, uint256 fee) external override onlyOwner {
        dex2fee[dexID] = fee;
        emit SetDex2fee(dexID, fee);
    }

    function setChain2oracle(uint64 chainID, address oracle) external override onlyOwner {
        chain2oracle[chainID] = oracle;
        emit SetChain2oracle(chainID, oracle);
    }

    function setToken2oracle(address token, address oracle) external override onlyOwner {
        token2oracle[token] = oracle;
        emit SetToken2oracle(token, oracle);
    }

    function setParamsBatch(ParamsBatch calldata params) external override onlyOwner {

        finishFee = params.finishFee;
        emit SetFinishFee(params.finishFee);

        for (uint i=0; i<params.dexFees.length; i++) {
            dex2fee[params.dexFees[i].dexID] = params.dexFees[i].fee;
            emit SetDex2fee(params.dexFees[i].dexID, params.dexFees[i].fee);
        }

        for (uint i=0; i<params.chainOracles.length; i++) {
            chain2oracle[params.chainOracles[i].chainID] = params.chainOracles[i].oracle;
            emit SetChain2oracle(params.chainOracles[i].chainID, params.chainOracles[i].oracle);
        }

        for (uint i=0; i<params.tokenOracles.length; i++) {
            token2oracle[params.tokenOracles[i].token] = params.tokenOracles[i].oracle;
            emit SetToken2oracle(params.tokenOracles[i].token, params.tokenOracles[i].oracle);
        }
    }

}
