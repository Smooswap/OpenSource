import React from 'react';
import './index.less';
import { Button } from 'antd';
import { ITx } from 'src/components/Main/hooks/useAggHistory';
import Pending from '../../../../../../static/img/pending.png';
import Finish from '../../../../../../static/img/finish.png';

export default ({
  tx,
  type,
  handleViewClick,
  handleWithDraw,
}) => {
  const renderRecord = () => {
    return tx.map((item: ITx, index) => {
      return (
        <div className={'history-finishTx-content'} key={index}>
          <div className={'history-finishTx-content-title'}>
            <div className={'history-finishTx-content-title-left'}>{`${item.srcToken?.symbol}-${item.desToken?.symbol}`}</div>
            <div className={'history-finishTx-content-title-right'}>{item.formatTime}</div>
          </div>
          <div className={'history-finishTx-content-sell'}>
            <div>Sell</div>
            <div className={'history-finishTx-content-sell-value'}>
              {item.srcToken?.value}
              <span>{item.srcToken?.symbol}</span>
            </div>
          </div>
          <div className={'history-finishTx-content-buy'}>
            <div>Buy</div>
            <div className={'history-finishTx-content-buy-value'}>
              {(item.withdrawTxHash || type === 'pending') ? '' : item.desToken?.value}
              <span>{item.desToken?.symbol}</span>
            </div>
          </div>
          <div className={'history-finishTx-info'}>
            <div className={'history-finishTx-name'}>  
              <Button
                type={'link'}
                size={'small'}
                style={{
                  borderRadius: 19,
                  fontSize: 12,
                  border: '1px solid #424242',
                  color: '#8C8DA2',
                  margin: '0 3px',
                }}>{item.type}
              </Button>
              {item.chainInfo.chainSymbol}
            </div>
            <div className={'history-finishTx-tags'}>
            {
              type === 'pending' && item.type !== 'local' &&
              <Button
                type={'link'}
                size={'small'}
                onClick={() => handleWithDraw(item)}
                style={{
                  borderRadius: 19,
                  fontSize: 12,
                  border: '1px solid #424242',
                  color: '#8C8DA2',
                  margin: '0 3px',
                }}>WithDraw
              </Button>
            }
            {
              type === 'done' && item.type !== 'local' && !item.withdrawTxHash &&
              <Button
                type={'link'}
                size={'small'}
                onClick={() => handleViewClick(item, 'finish')}
                style={{
                  borderRadius: 19,
                  fontSize: 12,
                  border: '1px solid #424242',
                  color: '#8C8DA2',
                  margin: '0 3px',
                }}>View finish on browser
              </Button>
            }
            {
              type === 'done' && item.type !== 'local' && item.withdrawTxHash &&
              <Button
                type={'link'}
                size={'small'}
                onClick={() => handleViewClick(item, 'withdraw')}
                style={{
                  borderRadius: 19,
                  fontSize: 12,
                  border: '1px solid #424242',
                  color: '#8C8DA2',
                  margin: '0 3px',
                }}>View withdrawn on browser
              </Button>
            }
            <Button 
              type={'link'} 
              size={'small'}
              onClick={() => handleViewClick(item, 'agg')}
              style={{
                borderRadius: 19,
                fontSize: 12,
                border: '1px solid #424242',
                color: '#8C8DA2',
                margin: '0 3px',
              }}>View on browser</Button>
            </div>
          </div>
        </div>
      );
    });
  }
  return (
    <div className={'history-finishTx'}>
      <div>
        <div className={'history-finishTx-title'}>
          {
            type === 'done' ?
            <>
              <img src={Finish} />
              <div className={'history-finishTx-title-text'}>Finish transaction</div>
            </> 
            :
            <>
              <img src={Pending} />
              <div className={'history-finishTx-title-text'}>Pending transaction</div>
            </> 
          }
        </div>
      </div>
      {
        renderRecord()
      }
    </div>
  )
}