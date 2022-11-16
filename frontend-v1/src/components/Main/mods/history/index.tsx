import React from 'react';
import useRecords from './hooks/useRecords';
import './index.less';
import NoData from './mods/NoData';
import FinishTx from './mods/FinishTx';
import { ReloadOutlined } from "@ant-design/icons";
import { Button } from 'antd';

export default () => {
  const { 
    pendingTx,
    doneTx,
    isLoading,
    handleTokenClick,
    handleViewClick,
    handleWithDraw,
    handleReloadClick,
   } = useRecords();
  return (
    <div className={'history-smoo'}>
      <div className={'history-wrapper'}>
        <div className={'history-wrapper-title'}>History</div>
        {
          !pendingTx.length && !doneTx.length &&
          <NoData /> 
        }
        {
          !!pendingTx.length &&
          <FinishTx
            tx={pendingTx}
            handleTokenClick={handleTokenClick}
            handleViewClick={handleViewClick}
            handleWithDraw={handleWithDraw}
            type='pending'
          />
        }
        {
          !!doneTx.length &&
          <FinishTx
            tx={doneTx}
            handleTokenClick={handleTokenClick}
            handleViewClick={handleViewClick}
            handleWithDraw={handleWithDraw}
            type='done'
          />
        }
      </div>
      <div className={'history-wrapper-reload'}>
        <Button
          onClick={() => handleReloadClick()}
          type="primary" 
          shape="circle" 
          loading={isLoading}
          icon={
            <ReloadOutlined style={{
                color: 'white',
                fontSize: 25,
              }} />
          }
          style={{
            background: 'rgb(104, 226, 97)',
            width: 35,
            height: 35,
            border: 'none',
          }}
        />
      </div>
    </div>
  )
}