import React, { useMemo } from 'react';
import './index.less';
import Logo from '../../static/img/logo.png';
import Bg from '../../static/img/bg.png';

const handleJump = (path: string) => {
  window.location.href = path;
}

const renderRoutes = () => {
  const routes = [
    ['Home', '/'],
    ['Whitepaper', '/smooswap.pdf'],
    ['Docs', '/#Docs'],
    ['Audit', '/#Audit']
  ];
  const pathname = window.location.pathname;

  return routes.map(([name, path]) => {
    return <a href={path} key={name} className={`${path === pathname ? 'home-header-path-select' : 'home-header-path-unselect'}`}>{name}</a>
  });
}

export default () => {
  const paths = useMemo(() => {
    return renderRoutes();
  }, [window.location.pathname]);
  return (
    <div>
      <img src={Bg} className={'home-bg'} />
      <div className="home-header">
        <div className='home-header-left'>
          <img src={Logo} className={'home-header-logo'} />  
        </div>
        <div className='home-header-right'>
          {paths}
        </div>
      </div>
      <div className={'home-content'}>
        <div className='home-content-title'>
          Faster, swifter and cheaper
        </div>
        <div className='home-content-desc'>
          Smoo Swap is a cross-chain liquidity aggregator that provides access to various DEXs, corss-chain bridges, and other Defi applications.
        </div>
        <div className='home-content-trader' onClick={() => handleJump('/trade')}>
          Trading App
        </div>
      </div>
    </div>
  )
}