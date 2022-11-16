import { RouteConfig } from 'react-router-config';
import Trade from './pages/Trade';
import Main from './pages/Main';

const routesConfig: RouteConfig[] = [
  {
    path: '/',
    exact: true,
    component: Main
  },
  {
    path: '/trade',
    exact: false,
    component: Trade
  },
]

export default routesConfig;