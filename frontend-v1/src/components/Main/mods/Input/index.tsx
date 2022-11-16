import React from 'react';
import './index.less';
import { Button } from 'antd';
import SelectToken from '../SelectToken';
import useInput from './hooks/useInput';
import DownoutPng from '../../../../static/img/downout.png'

export default ({
  title,
  style,
  token,
  setToken,
  otherToken,
  type,
  expectAmount,
}) => {
  const { 
    state,
    handleMaxClick, 
    updateSelectModal, 
    handleInputChange 
  } = useInput({ setToken, token });
  return (
    <>
      <div className={'swap-input-wrapper'} style={style}>
        <div className={'swap-input-header'}>
          <div className={'swap-input-title'}>{title}</div>
          <div className={'swap-input-balance'}>
            Balance: {state.balance}
          </div>
        </div>
        <div className={'swap-input-content'}>
          <div className={'swap-input-content-input-wrapper'}>
            <input
              type={'number'}
              max={state.balance}
              className={'swap-input-content-input'} 
              placeholder={'0.0'}
              style={{
                color: (type === 'in' && token?.value) || (type === 'out' && !!expectAmount) ? 'white' : '#B2B3CD',
              }}
              value={type === 'out' ? (parseFloat(expectAmount).toFixed(6) || '0.0') : token?.value}
              onChange={handleInputChange}
            />
          </div>
          { type === 'in' &&
            <Button type={'primary'} onClick={handleMaxClick} style={{
              border: 'none',
              backgroundColor: '#2B2B2B',
              padding: '0px 10px',
              height: '44px',
              width: 66,
              borderRadius: 22,
              marginLeft: 10,
              fontFamily: 'Poppins-Medium',
              color: '#8C8DA2'
            }}>Max</Button>
          }
          <div className={'swap-input-content-right'} onClick={() => updateSelectModal(true)}>
            {token?.symbol?.[0] && 
              <img 
                className={'swap-input-content-right-icon'}
                src={token.icon}
              ></img>
              }
            <div className={'swap-input-content-right-symbol'}>{token?.symbol || 'Select Token'}</div>
            <img src={DownoutPng} className={'swap-input-content-right-down'}/>
          </div>
        </div>
      </div>
      { state.showSelect && 
        <SelectToken
          type={type}
          setToken={setToken}
          otherToken={otherToken}
          updateSelectModal={updateSelectModal}
        />
        }
    </>
  );
}