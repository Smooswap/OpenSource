pragma solidity 0.8.1;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IDexLinker.sol";

contract UniswapV2Linker is IDexLinker {

    struct PairInfo {
        uint112 reserve0;
        uint112 reserve1;
        uint32 blockTimestampLast;
    }

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

    function swap(address srcToken, address desToken, address route, uint256 srcAmount) onlyProxy external override returns (uint256) {
        require(pairs[srcToken][desToken], "pair not init");

        address[] memory path;

        if (route == address(0)) {
            path = new address[](2);
            path[0] = srcToken;
            path[1] = desToken;
        } else {
            path = new address[](3);
            path[0] = srcToken;
            path[1] = route;
            path[2] = desToken;
        }

        uint256[] memory amounts = IUniswapV2Router02(_router).swapExactTokensForTokens(srcAmount, 0, path, msg.sender, block.timestamp);
        return amounts[amounts.length - 1];
    }

    function query(address token0, address token1) external view override returns (bytes memory infos) {

        address pair = IUniswapV2Factory(_factory).getPair(token0, token1);
        (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) = IUniswapV2Pair(pair).getReserves();

        return abi.encode(PairInfo(reserve0, reserve1, blockTimestampLast));
    }

    function pairExist(address token0, address token1) external view override returns (bool) {
        return _pairExist(token0, token1);
    }

    function _pairExist(address token0, address token1) internal view returns (bool) {
        address pair = IUniswapV2Factory(_factory).getPair(token0, token1);
        return (pair != address(0));
    }

    modifier onlyProxy() {
        require(_proxy == msg.sender, "caller is not the proxy");
        _;
    }

}