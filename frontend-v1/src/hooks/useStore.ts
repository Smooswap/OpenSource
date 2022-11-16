import React, { useContext, useMemo, useReducer } from "react";
import { IChain, IChainSettings, Action } from '../interface';
import { AggReducer, historyInitState, IState as IHistoryState } from '../components/Main/hooks/useAggHistory';
import { selectChainReducer, chainInitState } from '../components/Main/hooks/useSelectChain';
import { settingInitState, settingReducer } from './useSettings';
import { IConfigIintState, configIintState, configReducer } from './useConfigReducer';
import { ISwapInitState, swapInitState, swapReducer } from './swapReducer'
import { AllRoutes, routeInitState, routeReducer } from '../components/RouteSelect/hooks/useRouteSelect';
import combineReducers from 'react-combine-reducers';
import { useGobal } from "./useGobal";

export const MainInfo = React.createContext<any>({});

export const useStore = (): [ProfileState, Dispacth] => {
  return useContext(MainInfo);
}

type Dispacth = (ac: Action) => void;

type ProfileState = {
  history: IHistoryState;
  selectChain: IChain;
  routePath: AllRoutes;
  settings: IChainSettings;
  config: IConfigIintState;
  swap: ISwapInitState;
};

type ProfileReducer = (state: ProfileState, action: Action) => ProfileState;

const [profileReducer, initialProfile] = combineReducers<ProfileReducer>({
  settings: [settingReducer, settingInitState],
  history: [AggReducer, historyInitState],
  selectChain: [selectChainReducer, chainInitState],
  routePath: [routeReducer, routeInitState],
  config: [configReducer, configIintState],
  swap: [swapReducer, swapInitState]
});

/**
 * main network to other main test network, has error
 * https://github.com/ethers-io/ethers.js/issues/866
 */
export const useEnv = () => {
  const [state, dispatch] = useReducer<ProfileReducer>(profileReducer, initialProfile);

  const store = useMemo(() => [state, dispatch], [state, dispatch]);

  useGobal(dispatch);
  return {
    store
  };
}