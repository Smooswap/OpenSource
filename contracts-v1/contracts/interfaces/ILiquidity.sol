// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

interface ILiquidity {

    struct LiquidityParam {
        address token;
        uint256 amount;
    }

    // returns if the token has been initialized
    function tokenInitialized(address token) external returns (bool);

    // returns balance of token in liquidity contract
    function checkLiquidity(address token) external view returns (uint256);

    // init specific token by admin
    function initToken(address token) external;

    // batch init tokens by admin
    function initTokens(address[] calldata tokens) external;

    // add liquidity in specific token of this chain
    function addLiquidity(address token, uint256 amount) external payable;

    // remove liquidity in specific token of this chain
    function removeLiquidity(address token, uint256 amount) external;

    // batch add liquidity
    // params -> encoded as `LiquidityParam[]` in calldata
    function addLiquidityBatch(LiquidityParam[] calldata params) external;

    // batch remove liquidity
    // params -> encoded as `LiquidityParam[]` in calldata
    function removeLiquidityBatch(LiquidityParam[] calldata params) external;

    event InitToken(address token);

    event AddLiquidity(address token, uint256 amount);

    event RemoveLiquidity(address token, uint256 amount);

}
