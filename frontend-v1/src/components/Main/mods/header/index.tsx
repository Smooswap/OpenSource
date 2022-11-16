import React from 'react';
import './index.less';
import { useStore } from '../../../../hooks/useStore';
import settingPng from '../../../../static/img/setting.png';
import Reload from '../../../../components/Reload';

export default () => {
  const [state, dispatch] = useStore();
  return (
    <div className={'main-header-wrapper'}>
      <div className={'main-header-left-controls'}>
        <div  className={`main-header-title`}>
            {state.routePath}
          </div>
      </div>
      {
        state.routePath === 'Swap' &&
        <div className={'main-header-right-controls'}>
          <Reload />
          <img 
            onClick={() => dispatch({ type: 'updateConfigShow', payload: true })} 
            className={'main-header-left-controls-icon'} 
            src={settingPng} 
          />
        </div>
      }
    </div>
  )
}