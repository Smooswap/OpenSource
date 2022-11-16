// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

interface IEntry {

    struct QueryParam {
        address dex;
        address token0;
        address token1;
    }

    struct PairInfo {
        address dex;
        address token0;
        address token1;
        bytes info;
    }

    function query(QueryParam[] calldata params) external view returns (PairInfo[] memory infos);

}
