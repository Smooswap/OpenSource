import { useEffect, useRef, useState } from "react";
import { 
  erc20Approve,
  getERC20Allowance,
  getChainByname,
  getTokenBalance,
  sendSwapTransaction,
  getChainTokens,
  msgError,
  notificationTx,
  formatTime
} from "../../../utils";
import { useStore } from "../../../hooks/useStore";
import { BTNMSG, IChainSettings, IRecommendRoute, IToken, IPrice } from '../../../interface';
import { useWeb3React } from "@web3-react/core";
import { getRecommendRoutes } from "../../../api";
import { ethers } from "ethers";
import { useDebounce } from 'use-debounce';
import { ITx } from "./useAggHistory";
import north from '../../../../config/north.config';
import Sendtx from '../../../static/img/txsend.png';

export type ITokenAmount = IToken & {
  value?: number,
} | null;

type IBtnState = {
  disabled: boolean,
  msg: string,
  loading: boolean
}

const getDefaultToken = (settings: IChainSettings, chainId) => {
  const chainPair = settings.chainPairs.find(item => item.chainId === chainId);
  if (!chainPair) {
    msgError('get default select token error');
    return null;
  }

  const tokenIndex = chainPair.defaultSelectTokenIndex || 0;
  return {
    ...chainPair.tokens[tokenIndex],
    value: 1
  };
}

export type IState = {
  routes: IRecommendRoute[],
  allowance: number,
  selectRouteIndex: number,
  prices: IPrice
}

export const useSwap = () => {
  const [state, dispatch] = useStore();
  const { selectChain, settings, config } = state;
  const { library, account } = useWeb3React();
  const [inToken, setInToken] = useState<ITokenAmount>(getDefaultToken(settings, selectChain.chainId));
  const [debounceValue] = useDebounce(inToken?.value, 500);
  const [outToken, setOutToken] = useState<ITokenAmount>(null);
  const routeControl = useRef<AbortController>(null);

  const [btnState, setBtnState] = useState<IBtnState>({
    disabled: true,
    msg: 'please select token',
    loading: false,
  });
  const [aggState, setAggState] = useState<IState>({
    allowance: 0,
    routes: [],
    selectRouteIndex: 0,
    prices: {
      desToken: 0,
      sourceToken: 0,
      srcToken: 0,
    }
  });
  const tokens = getChainTokens(settings, selectChain.chainId);
  
  const handleTokenExchange = () => {
    setInToken(ptoken => ({ 
      ...outToken,
      value: ptoken.value
    }));
    setOutToken(ptoken => ({ ...ptoken, ...inToken }));
  }

  const getAggRoutes = async () => {
    if (!inToken.value || inToken.value == 0) return;

    if (routeControl.current) {
      routeControl.current?.abort();
      routeControl.current = null;
    }

    setBtnState(pstate => ({
      ...pstate,
      loading: true,
      msg: BTNMSG.calcRoute
    }));
    dispatch({
      type: 'needCountDown',
      payload: {
        needCountDown: false,
      }
    });
    try {
      const allowance = await getERC20Allowance(inToken.address, library, account, getChainByname(settings, selectChain.chainName).proxyAddress);
      const date = new Date();
      const sendTime = Date.now();
      north.setExtra(`getRecommendRoutes`, JSON.stringify({
        chainId: selectChain.platformChainId,
        srcToken: inToken,
        desToken: outToken,
        time: date.toISOString(),
      }));
      const control = new AbortController();
      routeControl.current = control;
      const res = await getRecommendRoutes({
        chainId: selectChain.platformChainId,
        srcToken: inToken.address,
        desToken: outToken.address,
        amount: ethers.utils.parseUnits(inToken.value?.toString(), inToken.decimals).toString()
      }, control.signal);

      if (res) {
        north.setExtra(`getRecommendRoutes result`, JSON.stringify({
          time: date.toISOString(),
          routes: res.routes,
          allowance,
          prices: res.prices,
          consumeTime: Date.now() - sendTime,
        }));
        setAggState(pstate => ({
          ...pstate,
          routes: res.routes,
          allowance,
          prices: res.prices,
        }));
        dispatch({
          type: 'needCountDown',
          payload: {
            needCountDown: true,
            needReload: false,
          }
        });
      } 
    } catch (e) {
      console.log('getAggRoutes error', e);
    }
    setBtnState(pstate => ({
      ...pstate,
      loading: false
    }));
  }

  const getAggRoutesBeforeCheck = () => {
    if (
      inToken?.address &&
      outToken?.address &&
      inToken.address !== outToken.address &&
      library
    ) {
      getAggRoutes();
    } else {
      dispatch({
        type: 'needCountDown',
        payload: {
          needCountDown: false,
          needReload: false,
        }
      });
    }
  }

  const changeSelectRouteIndex = (index: number) => {
    if (index !== aggState.selectRouteIndex)
      setAggState(pstate => ({
        ...pstate,
        selectRouteIndex: index
      }));
  }

  const doSwap = async () => {
    setBtnState(pstate => ({
      ...pstate,
      loading: true
    }));
    try {  
      const balance = await getTokenBalance(inToken.address, account, library, inToken.source);
      if (parseFloat(balance) < inToken.value) {
        msgError('Not enough tokens');
      } else {
        const withdrawDeadline = Math.floor((Date.now() + config.outTime * 60 * 1000) / 1000);
        console.log('aggState.routes[aggState.selectRouteIndex]', aggState.routes[aggState.selectRouteIndex])
        const tx = await sendSwapTransaction(
          aggState.routes[aggState.selectRouteIndex],
          selectChain,
          library,
          account,
          withdrawDeadline,
          inToken.source,
          inToken.value.toString(),
          config.fee === 'srcToken' ? 0 : 1
        );

        const transaction: ITx = {
          type: aggState.routes[aggState.selectRouteIndex].type,
          chainInfo: selectChain,
          srcToken: { ...inToken },
          desToken: { ...outToken },
          aggTxHash: tx.hash,
          etherTx: tx,
          withdrawDeadline,
          withdrawTxHash: '',
          blockTime: Date.now(),
          formatTime: formatTime(Date.now()),
          expectAmount: aggState.routes[aggState.selectRouteIndex].desAmount
        }

        north.setExtra('swap', JSON.stringify({
          routes: aggState.routes[aggState.selectRouteIndex],
          type: aggState.routes[aggState.selectRouteIndex].type,
          aggTxHash: tx.hash,
          account,
          selectChain: selectChain.chainName,
          inToken,
          outToken,
          time: new Date().toISOString(),
        }));
        notificationTx(`swap ${inToken.symbol} to ${outToken.symbol}, switch history see more information`, `Transaction send`, Sendtx);
        dispatch({
          type: 'createTx',
          payload: {
            ...transaction,
            account,
          }
        });
      }                                                                    
    } catch (e) {
      console.log(e)
      msgError(`swap error: ${e.message}`);
    }
    setBtnState(pstate => ({
      ...pstate,
      loading: false
    }));
  }

  const doApprove = async () => {
    setBtnState(pstate => ({
      ...pstate,
      loading: true
    }));
    try {
      const tx = await erc20Approve(inToken.address, library, account, getChainByname(settings, selectChain.chainName).proxyAddress);
      await tx.wait();
      setAggState(pstate => ({
        ...pstate,
        allowance: Number.MAX_SAFE_INTEGER,
      }));
    } catch (e) {
      console.log('approve error', e);
    }
    setBtnState(pstate => ({
      ...pstate,
      loading: false
    }));
  }

  const handleSwap = async () => {
    if (btnState.msg === BTNMSG.calcRoute) {
      await getAggRoutes()
    } else if (btnState.msg === BTNMSG.approve) {
      await doApprove();
    } else if (btnState.msg === BTNMSG.swap) {
      await doSwap();
    }
  }

  useEffect(() => {
    setInToken(pstate => ({
      ...pstate,
      ...getDefaultToken(settings, selectChain.chainId)
    }));

    setOutToken(null);
  }, [selectChain]);

  useEffect(() => {
    setAggState(pstate => ({
      allowance: 0,
      routes: [],
      selectRouteIndex: 0,
      prices: {
        desToken: 0,
        sourceToken: 0,
        srcToken: 0,
      }
    }));

  }, [inToken, outToken, selectChain, account]);

  useEffect(() => {
    let newState = {
      disabled: true,
      msg: '',
      loading: false,
    }

    if (!library) {
      newState.disabled = true;
      newState.msg = BTNMSG.connectWallect;
    } else if (!inToken?.address || !outToken?.address) {
      // two token address is null
      newState.disabled = true;
      newState.msg = BTNMSG.selectToken;
    } else if (inToken.address === outToken.address) {
      // two token equal
      newState.disabled = true;
      newState.msg = BTNMSG.noEqual;
    } else if (!inToken.value || inToken.value == 0) {
      // not input value
      newState.disabled = true;
      newState.msg = BTNMSG.enterAmount;
    } else if (!aggState.routes?.length){
      // route not calc route
      newState.disabled = false;
      newState.msg = BTNMSG.calcRoute;
    } else if (!inToken.source && aggState.allowance < inToken.value) {
      // token approve 
      newState.disabled = false;
      newState.msg = BTNMSG.approve;
    } else {
      newState.disabled = false;
      newState.msg = BTNMSG.swap;
    }

    setBtnState(newState);

  }, [inToken, outToken, aggState.routes, aggState.allowance, library]);

  useEffect(() => {
    getAggRoutesBeforeCheck();
  }, [debounceValue, inToken?.address, outToken?.address]);

  useEffect(() => {
    if (state.swap.needReload) {
      getAggRoutesBeforeCheck();
    }
  }, [state.swap.needReload]);

  return {
    setOutToken,
    handleTokenExchange,
    changeSelectRouteIndex,
    handleSwap,
    setInToken,
    inToken,
    outToken,
    btnState,
    aggState,
    routePath: state.routePath,
    config: state.config,
    tokens,
    selectChain,
  };
}