// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

// @notice inherited by DexLinker, there will be multiple DexLinkers which interact with dex
interface IDexLinker {

    function pairs(address srcToken, address desToken) external view returns (bool);

    function addPair(address token0, address token1) external;

    function removePair(address token0, address token1) external;

    // @notice call the contract of dex to finish swap
    function swap(address srcToken, address desToken, address route, uint256 srcAmount) external returns (uint256 desAmount);

    function query(address token0, address token1) external view returns (bytes memory infos);

    function pairExist(address token0, address token1) external view returns (bool);

}

