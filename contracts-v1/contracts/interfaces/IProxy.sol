// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.1;

interface IProxy {

    // aggregate data
    struct AggData {
        // who owns the aggregate position
        address user;
        // source token
        address srcToken;
        // destination token
        address desToken;
        // total source token amount
        uint256 totalAggSrcAmount;
        // total local completed destination token amount
        uint256 totalLocalDesAmount;
        // aggregate swap timeout at
        uint256 timeout;
    }

    struct AggregateEntryParams {
        address srcToken;
        address desToken;
        uint256 deadline;
        uint64[][] dexIDs;
        address[] routes;
        uint256[] amounts;
        uint8 feeMode; // 0: srcToken; 1: source token
    }

    struct SwapEntryParams {
        bytes32 txHash;
        address srcToken;
        address desToken;
        uint64[][] dexIDs;
        address[] routes;
        uint256[] amounts;
    }

    struct PairInfo {
        uint64[] dexIDs;
        address token0;
        address token1;
    }

    // returns minimum timeout duration(seconds)
    function minimumTimeout() external view returns (uint256);

    // returns contract address of dex linker
    function linkers(uint64 dexID) external view returns (address dexLinker);

    // returns contract address of fee calculator
    function feeCalculator() external view returns (address);

    // returns contract address of liquidity
    function liquidity() external view returns (address);

    // returns if mpc-node multi-sign address exists
    function mpc(address mpcAddr) external view returns (bool);

    // returns @param `user` who owns the aggregate position
    // returns @param `srcToken` source token
    // returns @param `desToken` destination token
    // returns @param `totalAggSrcAmount` total source token amount
    // returns @param `totalLocalDesAmount` total local completed destination token amount
    // returns @param `timestamp` aggregate swap timeout at
    function aggregates(uint64 aggID) external view returns (
        address user,
        address srcToken,
        address desToken,
        uint256 totalAggSrcAmount,
        uint256 totalLocalDesAmount,
        uint256 timestamp
    );

    // User Aggregated Transaction Entry
    // If chainID is the source chain, directly call dex linker to swap
    // If chainID is not the source chain, throws the AggregateExec event and is caught by the cross-chain bridge
    function aggregateEntry(AggregateEntryParams calldata params) external payable;

    // Cross-chain bridge swap entry
    // When the cross-chain bridge monitors the aggregateExec event, it selects the specific call chain according to the chainID
    // The proxy contract on each chain will have a swapEntry method as the swap entry for the cross-chain bridge
    // After success, a SwapEntry event will be thrown and monitored by the cross-chain bridge
    function swapEntry(SwapEntryParams calldata params) external;

    // Complete aggregate transaction by cross-chain bridge
    // In a aggregated transaction, after the cross-chain bridge executes the final state, a confirmation is sent to the source chain
    // After success, transfer the final swap assets to the user address
    function finish(uint64 aggregateID, uint256 srcAmount, uint256 desAmount) external;

    // Withdraw locked assets
    // When the cross-chain bridge has not completed the transaction within the timeout period, the user can withdraw the unfinished assets
    // After the user calls this function to withdraw assets, the cross-chain bridge can no longer call finish
    function withdraw(uint64 aggregateID) external;

    // Add a new dex linker by admin
    // Bind the newly deployed dex linker contract address to dexID
    function addDexLinker(uint64 dexID, address dexLinker) external;

    // remove a dex linker by admin
    function removeDexLinker(uint64 dexID) external;

    // add a new pair by admin
    // call specific dex linkers to initialize trade pairs
    function addPair(uint64[] calldata dexIDs, address token0, address token1) external;

    // remove a pair by admin
    function removePair(uint64[] calldata dexIDs, address token0, address token1) external;

    // batch adding new pairs by admin
    function addPairBatch(PairInfo[] calldata pairs) external;

    // batch removing pairs by admin
    function removePairBatch(PairInfo[] calldata pairs) external;

    // change contract address of liquidity bound to proxy contract
    function changeLiquidity(address liquidity) external;

    // change contract address of fee calculator bound to proxy contract
    function changeFeeCalculator(address feeCal) external;

    // set minimum timeout duration by admin
    function setMinimumTimeout(uint256 _minimumTimeout) external;

    // add mpc-node multi-sign address by admin
    function addMpc(address mpc) external;

    // remove mpc-node multi-sign address by admin
    function removeMpc(address mpc) external;

    // @notice Emitted when a cross-chain aggregate swap is created
    event AggregateExec(uint64 aggregateID, uint256 withdrawDeadline, address sender, address srcToken, address desToken,
        uint256 totalLocalDesAmount, uint64[][] dexIDs, address[] routes, uint256[] amounts);

    // @notice Emitted when a local aggregate swap is finished
    event AggregateExecLocal(address sender, address srcToken, address desToken, uint64[][] dexIDs,
        address[] routes, uint256[] amounts, uint256 totalDesAmount);

    // @notice Emitted when a cross-chain swap is executed in destination chain
    event SwapEntry(bytes32 txHash, address srcToken, address desToken, uint64[][] dexIDs, uint256[] amounts, uint256 totalDesAmount);

    // @notice Emitted when a cross-chain swap is finally finished in source chain
    event Finish(uint64 aggregateID, uint256 srcAmount, uint256 desAmount);

    // @notice Emitted when a user withdraw assets if timeout
    event Withdraw(uint64 aggregateID);

    // @notice Emitted when a new dex linker added to proxy
    event AddDexLinker(uint64 dexID, address dex);

    // @notice Emitted when a dex linker removed from proxy
    event RemoveDexLinker(uint64 dexID);

    event AddPair(uint64[] dexIDs, address token0, address token1);

    event RemovePair(uint64[] dexIDs, address token0, address token1);

    event AddMpc(address mpc);

    event RemoveMpc(address mpc);

    event ChangeLiquidity(address liquidity);

    event ChangeFeeCalculator(address feeCal);

    event SetMinimumTimeout(uint256 minimumTimeout);
}