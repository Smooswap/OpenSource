import React from 'react';
import Header from './mods/header';
import './index.less';
import { useSwap } from './hooks/useSwap';
import AggInfo from './mods/AggInfo';
import History from './mods/history';
import Swap from './Swap';
import { AllRoutes } from '../RouteSelect/hooks/useRouteSelect';

export default () => {
  const props = useSwap();
  const {
    inToken,
    outToken,
    aggState,
    routePath,
    changeSelectRouteIndex,
  } = props;
  return (
    <>
      <div className={'main-wrapper'} key={'swap'}>
          {
            routePath !== AllRoutes.History && 
            <Header />
          }
          {
            routePath === AllRoutes.Swap &&
            <Swap {...props} />
          }
          
          { aggState?.routes?.length !== 0 && routePath === AllRoutes.Swap &&
            inToken?.symbol && outToken?.symbol &&
            <AggInfo
              key={'agg'}
              aggState={aggState}
              inToken={inToken}
              outToken={outToken}
              changeSelectRouteIndex={changeSelectRouteIndex}
            />
          }
          {
            routePath === AllRoutes.History &&
            <History />
          }
      </div>
    </>
  )
}