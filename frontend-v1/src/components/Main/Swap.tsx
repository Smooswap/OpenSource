import React from 'react';
import Input  from './mods/Input';
import { Button, Tooltip } from 'antd';
import { IState } from './hooks/useSwap';
import Setting from './mods/Setting';
import { ethers } from 'ethers';
import { IChain, IToken, IRecommendRoute, IPrice } from '../../interface';
import SwapBtn from '../../static/img/swap.png';
import { upperTitle } from '../../utils';
import { InfoCircleOutlined } from '@ant-design/icons';

const getAmount = (tokens: IToken[], route: IRecommendRoute, outToken, inToken, prices: IPrice) => {
  if (!route || !outToken?.address || !inToken?.address) return null;

  const desToken = tokens.find(token => token.address === route.desToken) || outToken;
  const amount = ethers.utils.formatUnits(route.desAmount, desToken.decimals);
  const amountValue = parseFloat(amount) * (prices?.desToken || 0);
  const corssFeeAmount = ethers.utils.formatUnits(route.fee, inToken.decimals);
  const corssFeeAmountValue = parseFloat(corssFeeAmount) * (prices?.srcToken || 0);
  const gasFeeAmount = ethers.utils.formatEther(route.gasFee);
  const gasFeeAmountValue = parseFloat(gasFeeAmount) * (prices?.sourceToken || 0);

  return {
    amount,
    amountValue,
    corssFeeAmount,
    corssFeeAmountValue,
    gasFeeAmount,
    gasFeeAmountValue,
  }
}

const renderSketchRoutes = (aggState: IState, handleClick, outToken, inToken, tokens: IToken[], selectChain: IChain) => {
  if (!aggState.routes?.length || !outToken?.address || !inToken?.address) return null;

  const fractionDigits = 4;

  return (
    <div className={'swap-sketch-route-wrapper'} key={'renderSketchRoutes'}>
      {
        aggState.routes.map((route, index) => {
          const swapInfo = getAmount(tokens, route, outToken, inToken, aggState.prices);
          return (
            <div
              className={'swap-sketch-route-wrapper-item'}
              key={route.srcToken + index}
              onClick={() => handleClick(index)}
              style={{
                border: index === aggState.selectRouteIndex ? '2px solid #68E261' : '2px solid #383838',
              }}
            >
              <div className={'swap-sketch-route-wrapper-top'}>
                <div className={'swap-sketch-route-wrapper-top-left'}>
                  {
                    route.chainRoutes.map((chain, index) => {
                      return (
                        <div className={'swap-sketch-route-wrapper-icon'} key={chain.chainSymbol + index}>
                          <img src={chain.chainIcon} className={'swap-sketch-route-wrapper-icon-img'}></img>
                          <div className={'swap-sketch-route-wrapper-chainName'}>{chain.chainSymbol}</div>
                        </div>
                      )
                    })
                  }
                </div>
                <div className={'swap-sketch-route-wrapper-desAmount'}>{parseFloat(swapInfo.amount).toFixed(4)}</div>
              </div>
              <div className={'swap-sketch-route-wrapper-bottom'}>
                <div className={'swap-sketch-route-wrapper-fee'}>
                  {/* {`tx cost ${parseFloat(corssFeeAmount).toFixed(fractionDigits)} (~$ ${corssFeeAmountValue.toFixed(fractionDigits)})`} */}
                  {`tx fee cost ~$ ${(swapInfo.gasFeeAmountValue + swapInfo.corssFeeAmountValue).toFixed(fractionDigits)} `}
                  <Tooltip 
                    overlayStyle={{
                      fontFamily: 'Poppins',
                    }} 
                    title={
                      <>
                        <div>{`GasFee: ${parseFloat(swapInfo.gasFeeAmount).toFixed(fractionDigits)} ${selectChain?.networkInfo?.nativeCurrency?.symbol}`}</div>
                        <div>{`CorssFee: ${parseFloat(swapInfo.corssFeeAmount).toFixed(fractionDigits)} ${inToken.symbol}`}</div>
                      </>
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
                <div className={'swap-sketch-route-wrapper-cost'}>~${` ${swapInfo.amountValue.toFixed(fractionDigits)}`}</div>
              </div>
              <div
                className={'swap-sketch-route-wrapper-primary'}
                style={{
                  background: index === aggState.selectRouteIndex ? '#68E261' : '#383838',
                  color: index === aggState.selectRouteIndex ? '#0B0B10' : 'white',
                }}
              >{upperTitle(route.mode)}</div>
              
            </div>
          )
        })
      }
    </div>
  );
}

export default (props) => {
  const {
    inToken,
    setInToken,
    outToken,
    setOutToken,
    handleTokenExchange,
    changeSelectRouteIndex,
    btnState,
    handleSwap,
    aggState,
    config,
    tokens,
    selectChain,
  } = props;

  const selectSwapInfo = getAmount(
    tokens, 
    aggState.routes?.[aggState?.selectRouteIndex], 
    outToken, 
    inToken, 
    aggState.prices
  );
  return (
    <>
      <Input 
          title={'You sell'} 
          style={{
            marginTop: 15
          }}
          token={inToken}
          otherToken={outToken}
          setToken={setInToken}
          type={'in'}
          expectAmount={selectSwapInfo?.amount}
        />
        <div className={'swap-btn-wrapper'}>
          <img src={SwapBtn} className={'swap-btn'} onClick={handleTokenExchange} />
        </div>
        <Input 
          title={'You buy'} 
          style={{
            background: '#0B0B10',
            border: '1px solid #1E1E1E',
            marginTop: 9,
          }}
          token={outToken}
          otherToken={inToken}
          setToken={setOutToken}
          type={'out'}
          expectAmount={selectSwapInfo?.amount}
        />
        {
          renderSketchRoutes(aggState, changeSelectRouteIndex, outToken, inToken, tokens, selectChain)
        }
        <Button
          loading={btnState.loading}
          onClick={handleSwap}
          disabled={btnState.disabled}
          style={{
            width: '100%',
            borderRadius: '24px',
            marginTop: '20px',
            height: '50px',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'Poppins-Medium',
            opacity: btnState.disabled ? '0.5' : 1,
            backgroundColor: '#68E261',
            color: btnState.disabled ? 'rgba(11, 11, 16, .5)' : '#0B0B10',
          }}
        >
          {btnState.msg}
        </Button>
        { config.showConfig && <Setting /> }
    </>
  )
}