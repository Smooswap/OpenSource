import React from 'react';
import './index.less';
import loadingGif from '../../static/img/loading.gif';

export default () => {
  return (
    <div className="loading-wrapper">
      <div className={'loading-content'}>
        <img className={'loading-gif'} src={loadingGif}></img>
        <div className={'loading-text'}>Loading latest version of SmooSwap</div>
      </div>
    </div>
  )
}