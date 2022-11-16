// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ILiquidity.sol";
import "./interfaces/IWETH.sol";

contract Liquidity is ILiquidity, Ownable {

    using SafeERC20 for IERC20;

    mapping(address => bool) public override tokenInitialized;
    address public _proxy;
    address public _lp;
    address public _wETH;

    constructor(address proxy, address lp, address wETH) {
        _proxy = proxy;
        _lp = lp;
        _wETH = wETH;
    }

    function checkLiquidity(address token) external override view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function initToken(address token) external override onlyOwner {
        require(!tokenInitialized[token], "token already init");
        IERC20(token).approve(_proxy, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        tokenInitialized[token] = true;

        emit InitToken(token);
    }

    function initTokens(address[] calldata tokens) external override onlyOwner {
        for (uint i=0; i<tokens.length; i++) {
            if (!tokenInitialized[tokens[i]]) {
                IERC20(tokens[i]).approve(_proxy, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
                tokenInitialized[tokens[i]] = true;
                emit InitToken(tokens[i]);
            }
        }
    }

    function addLiquidity(address token, uint256 amount) external payable onlyLP override {
        require(tokenInitialized[token], "not init");

        if (token == _wETH) {
            IWETH(_wETH).deposit{value: amount}();
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        emit AddLiquidity(token, amount);
    }

    function removeLiquidity(address token, uint256 amount) external onlyLP override {
        require(tokenInitialized[token], "not init");

        if (token == _wETH) {
            IWETH(_wETH).withdraw(amount);
            msg.sender.call{value: amount}(new bytes(0));
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit RemoveLiquidity(token, amount);
    }

    function addLiquidityBatch(LiquidityParam[] calldata params) external onlyLP override {
        for (uint i=0; i<params.length; i++) {
            require(tokenInitialized[params[i].token], "not init");
            IERC20(params[i].token).safeTransferFrom(msg.sender, address(this), params[i].amount);
            emit AddLiquidity(params[i].token, params[i].amount);
        }
    }

    function removeLiquidityBatch(LiquidityParam[] calldata params) external onlyLP override {
        for (uint i=0; i<params.length; i++) {
            require(tokenInitialized[params[i].token], "not init");
            IERC20(params[i].token).safeTransfer(msg.sender, params[i].amount);
            emit RemoveLiquidity(params[i].token, params[i].amount);
        }
    }

    modifier onlyLP() {
        require(_lp == msg.sender, "caller is not the lp");
        _;
    }

}
