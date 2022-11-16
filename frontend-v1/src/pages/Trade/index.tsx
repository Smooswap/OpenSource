import React from 'react';
import RouteSelect from '../../components/RouteSelect';
import Header from '../../components/Header';
import Main from '../../components/Main';
import { MainInfo, useEnv } from '../../hooks/useStore';
import './index.less';
import Loading from '../../components/loading';

export default () => {
  const { store } = useEnv();
  return (
      <MainInfo.Provider value={store}>
        {
          (store as any)[0]?.selectChain ?
          <div className={'main'}>
            <Header />
            <RouteSelect />
            <Main />
            <div className={'bg'} />
            <div className={'bg-green'} />
          </div>
          :
          <Loading />
        }
      </MainInfo.Provider>
  )
}