// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

interface IFeeCalculator {

    struct DexFee {
        uint64 dexID;
        uint256 fee;
    }

    struct ChainOracle {
        uint64 chainID;
        address oracle;
    }

    struct TokenOracle {
        address token;
        address oracle;
    }

    struct ParamsBatch {
        uint256 finishFee;
        DexFee[] dexFees;
        ChainOracle[] chainOracles;
        TokenOracle[] tokenOracles;
    }

    // gas cost in finish call calculated by source token in local chain
    function finishFee() external view returns (uint256);

    // which chain does the target dex belong to
    function dex2chain(uint64 dexID) external view returns (uint64);

    // gas cost in specific dex swap call calculated by source token in local chain
    function dex2fee(uint64 dexID) external view returns (uint256);

    // chainlink oracle address of source token in specific chain
    function chain2oracle(uint64 chainID) external view returns (address);

    // chainlink oracle address of specific token
    function token2oracle(address token) external view returns (address);

    // calculate fee cost in specific token when a cross-chain swap emitted
    function calFee(bytes calldata data) external view returns (uint256);

    // returns the price of specific token to USD (decimals 18)
    function token2UPrice(address token) external view returns (uint256);

    // returns the price of specific chain source token to USD (decimals 18)
    function chainToken2UPrice(uint64 chainID) external view returns (uint256);

    // set finish fee by admin
    // finish fee = finish gas * gas price (in source token with 18 decimals)
    function setFinishFee(uint256 finishFee) external;

    // set dex fee by admin
    // dex fee = dex gas * gas price (in source token with 18 decimals)
    function setDex2fee(uint64 dexID, uint256 fee) external;

    // set chainlink oracle address of specific chain source token by admin
    function setChain2oracle(uint64 chainID, address oracle) external;

    // set chainlink oracle address of specific token by admin
    function setToken2oracle(address token, address oracle) external;

    // Batch setting parameters of FeeCalculator contract
    // params -> encoded as `ParamsBatch` in calldata
    function setParamsBatch(ParamsBatch calldata params) external;

    event SetFinishFee(uint256 fee);

    event SetDex2fee(uint64 dexID, uint256 fee);

    event SetChain2oracle(uint64 chainID, address oracle);

    event SetToken2oracle(address token, address oracle);

}
