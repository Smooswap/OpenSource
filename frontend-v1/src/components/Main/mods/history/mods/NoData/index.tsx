import React from 'react';
import './index.less';
import { useWeb3React } from '@web3-react/core';

export default () => {
  const { active } = useWeb3React();
  return (
    <div className={'history-noData'}>
      <div className={'history-noData-desc'}>
        {active ? 'No Fund Transaction Record' : 'Please connect wallet'}
      </div>
    </div>
  )
}