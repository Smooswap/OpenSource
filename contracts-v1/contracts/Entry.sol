// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

import "./interfaces/IDexLinker.sol";
import "./interfaces/IEntry.sol";

contract Entry is IEntry {

    function query(QueryParam[] calldata params) external override view returns (PairInfo[] memory) {

        PairInfo[] memory pairInfos = new PairInfo[](params.length);

        for (uint i = 0; i < params.length; i++) {

            bytes memory info = IDexLinker(params[i].dex).query(params[i].token0, params[i].token1);
            pairInfos[i] = PairInfo(params[i].dex, params[i].token0, params[i].token1, info);

        }

        return pairInfos;
    }

}
