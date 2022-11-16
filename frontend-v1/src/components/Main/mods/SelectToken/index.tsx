import React from 'react';
import useSelectToken from './hooks/useSelectToken';
import './index.less';
import { IToken } from '../../../../interface';
import { Button } from 'antd';
import BackSvg from '../../../../static/img/back.png'

const renderTags = (token: IToken, handleTagClick) => {
  return (
    <div 
      className={'select-token-wrapper-tag-content'} 
      key={token.symbol} 
      onClick={() => handleTagClick(token, 'tag')}
    >
      <img className={'select-token-wrapper-tag-icon'} src={token.icon} />
      <div className={'select-token-wrapper-tag-name'}>{token.symbol}</div>
    </div>
  )
}

const renderList = (token: IToken, handleClick) => {
  return (
    <div 
      className={'select-token-wrapper-list-item'} 
      key={token.symbol} 
      onClick={() => handleClick(token, 'list')}
    >
      <div className={'select-token-wrapper-list-left'}>
        <img className={'select-token-wrapper-list-icon'} src={token.icon} />
        <div className={'select-token-wrapper-list-name'}>{token.symbol}</div>
      </div>
      <div className={'select-token-wrapper-list-balance'}>{token.balance || 0}</div>
    </div>
  )
}

export default ({ setToken, updateSelectModal, type, otherToken }) => {
  const { state, handleSelect, handleReset } = useSelectToken({ setToken, type, otherToken, updateSelectModal });

  return (
    <div className={'select-token-wrapper'}>
      <div className={'select-token-wrapper-header'}>
        <img src={BackSvg} className={'select-token-wrapper-header-back'} onClick={()=> updateSelectModal(false)} />
        <div className={'select-token-wrapper-header-title'}>
            Select a token
          </div>
        <Button type={'default'} className={'select-token-wrapper-header-reset'} size={'small'} ghost onClick={handleReset} >reset</Button>
      </div>
      <input disabled className={'select-token-wrapper-search'} placeholder={'current not support custom import token'} />
      { state.collectTokens.length && 
        <div className={'select-token-wrapper-tag'}>
          {
            state.collectTokens.map((item) => renderTags(item, handleSelect))
          }
        </div>
      }
      <div className={'select-token-wrapper-list'}>
        <div className={'select-token-wrapper-list-content'}>
          {
            state.supportTokens && state.supportTokens.map((item) => renderList(item, handleSelect))
          }
        </div>
      </div>
    </div>
  )
}