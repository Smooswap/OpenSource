import { useState } from 'react';

export enum AllRoutes {
  swap = 'swap',
  history = 'history',
}

export default () => {
  const [headerRoute, setHeaderRoute] = useState<AllRoutes>(AllRoutes.swap);
  return {
    headerRoute,
    setHeaderRoute,
  }
}