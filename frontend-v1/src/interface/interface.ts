export type IChainSettings = {
  chains: IChain[],
  defaultChain: IChain,
  chainPairs: IChainPair[],
}

export type IChain = {
  chainId: number,
  platformChainId: number,
  chainName: string,
  chainSymbol: string,
  chainIcon: string,
  networkInfo: INetworkInfo,
  blockHeight: number,
  proxyAddress: string,
  proxyAbi: any,
}

export type INetworkInfo = {
  chainId: string,
  chainName: string,
  rpcUrls: string[],
  blockExplorerUrls: string[],
  nativeCurrency: INativeCurrency,
}

type INativeCurrency = {
  name: string,
  symbol: string,
  decimals: number,
}

type IChainPair = {
  chainId: number,
  tokens: IToken[],
  pairs: IPair[],
  defaultSelectTokenIndex?: number,
}

export type IToken = {
  address: string,
  symbol: string,
  icon: string,
  balance?: string,
  decimals: number,
  source: boolean,
}

type IPair = {
  token0: string,
  token1: string
}

export type IPrice = {
  desToken: number,
  sourceToken: number,
  srcToken: number,
}

export type IRecommendRouteRes = {
  routes: IRecommendRoute[],
  prices: IPrice,
}

export type IRecommendRoute = {
  desAmount: string,
  gasFee: string,
  fee: string,
  price: string,
  type: IRouteType,
  chainRoutes: IChainRoute[],
  srcToken: string,
  desToken: string,
  dexIds: number[][],
  routes: string[],
  amount: string[],
  mode: 'best' | 'fast'
}

type IRouteType = 'local' | 'crossChain' | 'mixCrossChain';

type IChainRoute = {
  chainId: number,
  chainName: string,
  chainIcon: string,
  srcAmount: string,
  srcRatio: string,
  chainSymbol: string,
  dexRoutes: IDexRoute[][]
}

export type IDexRoute = {
  dexId: number,
  dexName: string,
  srcAmount: string,
  srcRatio: string,
  swapRoutes: string[],
}

export type IHistoryTxs = {
  finishedTx: ITxInfo[],
  pendingTx: ITxInfo[],
}

export type ITxType = IRouteType;

export type ITxInfo = {
  chainId: number,
  aggId: number,
  blockTime: number,
  type: ITxType,
  withdrawDeadline: number,
  srcToken: IToken,
  desToken: IToken,
  aggTxHash: string,
  finishTxHash: string,
  withdrawTxHash: string,
}

export type Action = {
  type: string;
  payload?: any;
};

export type ITokenPrice = {
  price: number;
  timeStamp: number;
}