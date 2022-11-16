import React from 'react';
import './index.less';
import { SwapRightOutlined } from '@ant-design/icons';
import { Button, Tag, Spin } from 'antd';
import { ITx } from '../../../../hooks/useAggHistory';

export default ({
  tx
}: {
  tx: ITx[],
}) => {
  const renderRecord = () => {
    return tx.map((item, index) => {
      return (
        <div className={'history-pendingTx-content'} key={index}>
          <div className={'history-pendingTx-info'}>
            <div className={'history-pendingTx-name'}>  
              <Tag color={'#87d068'}>{item.type}</Tag>
              {item.chainInfo.label}
            </div>
            <div className={'history-pendingTx-tags'}>
              <Spin style={{
                marginLeft: 20
              }} />
            </div>
          </div>
          <div className={'history-pendingTx-path'}>
            <div className={'history-pendingTx-token'}>{item.fromToken.name}</div>
            <div className={'history-pendingTx-swap'}>
              <div className={'history-pendingTx-value'}>
                Sell: {item.fromToken.value}
              </div>
              <SwapRightOutlined style={{
                transform: 'scaleX(3.5)',
                color: '#88b1fa'
              }} />
            </div>
            <div className={'history-pendingTx-token'}>{item.outToken.name}</div>
          </div>
          <div className={'history-pendingTx-control'}>
            <Button
              type={'link'}
              size={'small'}
              style={{
                borderRadius: 15,
              }}>WithDraw</Button>
            <Button 
              type={'link'} 
              size={'small'} 
              style={{
                borderRadius: 15,
              }}>View on browser</Button>
          </div>
        </div>
      );
    });
  }
  return (
    <div className={'history-pendingTx'}>
      <div>
        <div className={'history-pendingTx-title'}>Pending transaction</div>
      </div>
      {
        renderRecord()
      }
    </div>
  )
}