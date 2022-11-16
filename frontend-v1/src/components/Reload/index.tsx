import React from 'react';
import { Tooltip, Progress } from 'antd';
import useReload from './hooks/useReload';
import './index.less';
import { LoadingOutlined } from "@ant-design/icons";

export default () => {
  const { percent, needCountDown, count, handleClick, needReload } = useReload();

  if (!needReload && !needCountDown) {
    return null;
  }
  return (
    needCountDown ?
      <Tooltip
        overlayStyle={{
          fontFamily: 'Poppins',
        }}
        title={
          `the data will be updated after ${count} seconds, click here to manually update`
        }>
          <div className={'reload-wrapper'} onClick={handleClick} >
            <Progress 
            format={() => null}
            strokeColor={'rgb(104, 226, 97)'} 
            showInfo={false} 
            strokeWidth={12} 
            width={20} 
            type="circle"
            percent={percent} 
            />
          </div>
      </Tooltip>
    :
      <LoadingOutlined style={{
        fontSize: 20,
        color: 'rgb(104, 226, 97)',
      }} />
  )
}