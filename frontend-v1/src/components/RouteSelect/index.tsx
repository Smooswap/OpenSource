import React from 'react';
import { useStore } from '../../hooks/useStore';
import { AllRoutes } from '../Main/hooks/useHeaderRoute';
import './index.less'

export default () => {
  const paths = Object.entries(AllRoutes);
  const [state, dispatch] = useStore();
  const handleClick = (path: string) => {
    dispatch({
      type: 'updatePath',
      payload: path
    });
  }
  return (
    <div className={'router-wrap'}>
      <div className={'router-wrap-content'}>
      {
        paths.map((item, index) => {
          const path = item[0].charAt(0).toUpperCase() + item[0].slice(1)
          return (
            <div 
              onClick={() => handleClick(path)} 
              className={`router-wrap-item ${state.routePath === path ? 'router-wrap-select' : 'router-wrap-unselect'}`} 
              key={path + index}>{path}</div>
          )
        })
      }
      </div>
    </div>
  )
}