pragma solidity 0.8.1;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IDexLinker.sol";
import "../libraries/TickBitmap.sol";
import "../libraries/TickMath.sol";

contract UniswapV3F500Linker is IDexLinker {

    struct PairInfo {
        TickInfo[10] upperTicks;
        TickInfo[10] lowerTicks;
        uint160 sqrtPriceX96;
        uint128 liquidity;
        int24 tick;
    }

    struct TickInfo {
        uint160 sqrtPriceX96;
        int128 liquidityNet;
        int24 tick;
    }

    uint24 private constant fee = 500;
    int24 private constant tickSpacing = 10;

    address public _proxy;
    address public _factory;
    address public _router;
    mapping(address => mapping(address => bool)) public override pairs;

    constructor(address proxy, address factory, address router) {
        _proxy = proxy;
        _factory = factory;
        _router = router;
    }

    function addPair(address token0, address token1) onlyProxy external override {
        if (pairs[token0][token1]) {
            return;
        }

        require(_pairExist(token0, token1), "pair not exist in dex");
        if (IERC20(token0).allowance(address(this), _router) == 0) {
            IERC20(token0).approve(_router, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        }

        if (IERC20(token1).allowance(address(this), _router) == 0) {
            IERC20(token1).approve(_router, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        }

        pairs[token0][token1] = true;
        pairs[token1][token0] = true;
    }

    function removePair(address token0, address token1) onlyProxy external override {
        if (!pairs[token0][token1]) {
            return;
        }

        pairs[token0][token1] = false;
        pairs[token1][token0] = false;
    }

    function swap(address srcToken, address desToken, address route, uint256 srcAmount) onlyProxy external override returns (uint256 desAmount) {
        require(pairs[srcToken][desToken], "pair not init");

        if (route == address(0)) {

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: srcToken,
            tokenOut: desToken,
            fee: fee,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: srcAmount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
            });

            desAmount = ISwapRouter(_router).exactInputSingle(params);

        } else {

            ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
            path: abi.encodePacked(srcToken, fee, route, fee, desToken),
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: srcAmount,
            amountOutMinimum: 0
            });

            desAmount = ISwapRouter(_router).exactInput(params);
        }

        return desAmount;
    }

    function query(address token0, address token1) external view override returns (bytes memory infos) {
        address pool = IUniswapV3Factory(_factory).getPool(token0, token1, fee);
        IUniswapV3Pool v3Pool = IUniswapV3Pool(pool);

        (uint160 sqrtPriceX96, int24 tick, , , , , ) = v3Pool.slot0();
        uint128 liquidity = v3Pool.liquidity();

        int24 tickUpper = tick;
        int24 tickLower = tick;
        TickInfo[10] memory upperTicks;
        TickInfo[10] memory lowerTicks;

        for (uint i=0; i<10; i++) {

            {
                bool initialized;
                (tickUpper, initialized) = TickBitmap.nextInitializedTickWithinOneWord(
                    v3Pool,
                    tickUpper,
                    tickSpacing,
                    false
                );

                int128 liquidityNet;
                if (initialized) {
                    ( , liquidityNet, , , , , , ) = v3Pool.ticks(tickUpper);
                }

                upperTicks[i] = TickInfo(TickMath.getSqrtRatioAtTick(tickUpper), liquidityNet, tickUpper);
            }

            {
                bool initialized;
                (tickLower, initialized) = TickBitmap.nextInitializedTickWithinOneWord(
                    v3Pool,
                    tickLower,
                    tickSpacing,
                    true
                );

                int128 liquidityNet;
                if (initialized) {
                    ( , liquidityNet, , , , , , ) = v3Pool.ticks(tickLower);
                }

                lowerTicks[i] = TickInfo(TickMath.getSqrtRatioAtTick(tickLower), liquidityNet, tickLower);
                tickLower -= 1;
            }

        }

        return abi.encode(PairInfo(
                upperTicks, lowerTicks, sqrtPriceX96, liquidity, tick)
        );
    }

    function pairExist(address token0, address token1) external view override returns (bool) {
        return _pairExist(token0, token1);
    }

    function _pairExist(address token0, address token1) internal view returns (bool) {
        address pool = IUniswapV3Factory(_factory).getPool(token0, token1, fee);
        return (pool != address(0));
    }

    modifier onlyProxy() {
        require(_proxy == msg.sender, "caller is not the proxy");
        _;
    }

}
