import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, matchPath } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import routes from './routeConfig';
import './gobal.less';
import north from '../config/north.config';
import { North } from '@zblock/north';
import {Web3ReactProvider} from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers'
import 'antd/dist/antd.css';

north.init({
  sentry: {
    integrations: [
      new North.BrowserTracing({
        routingInstrumentation: North.Sentry.reactRouterV4Instrumentation(history, routes as any, matchPath),
      }),
    ],
  }
});

function getLibrary(provider) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 10000
  return library
}


ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <BrowserRouter>
    <Switch>
      {renderRoutes(routes)}
    </Switch>
  </BrowserRouter>
  </Web3ReactProvider>,
  document.getElementById('root')
)