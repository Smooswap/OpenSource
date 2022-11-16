import { Tabs, Button } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';
import { IRecommendRoute, IToken, IDexRoute } from '../../../../interface';
import morePng from '../../../../static/img/more.png';
import './index.less';
import { RightOutlined } from '@ant-design/icons';
import useAggInfo from './useAggInfo';
import { upperTitle } from '../../../../utils';

export default ({
  inToken,
  outToken,
  aggState,
  changeSelectRouteIndex,
}) => {
  const { state, changeModalState, handlePaneChange, handleSelect } = useAggInfo(changeSelectRouteIndex);
  const aggInfo: IRecommendRoute = aggState.routes[aggState.selectRouteIndex];
  const outPrice = aggInfo.price;
  const inPrice = outPrice ? (1 / parseFloat(outPrice)).toFixed(4) : 0;
  /**
   * check if any routes dex length more than 2, modal width should big
   */
  const BigModal = !!aggState.routes[state.paneIndex].chainRoutes.find((chainRoute) => {
    return chainRoute.dexRoutes.find((dex) => {
      return dex.length > 1
    })
  });


  return (
    <div className={'agginfo-wrapper'}>
      {renderPrice(inToken, outToken, inPrice, 'inPrice')}
      {renderPrice(outToken, inToken, outPrice, 'outPrice')}
      {/* {renderTag('Part', aggState.part, { fontSize: 18, color: 'white' })} */}
      <div className={'agginfo-item-wrapper'} >
        <div>Route</div>
        <div className={'agginfo-item-wrapper-right'} onClick={() => changeModalState(true)}>
          {`${inToken.symbol} > ${outToken.symbol}`}
          <img className={'agginfo-item-wrapper-more'} src={morePng} />
        </div>
      </div>
      <Modal
        visible={state.showModal}
        centered
        okText={'determine'}
        title={'Routing'}
        className={'aggInfo-route'}
        bodyStyle={{
          backgroundColor: '#131516',
          paddingTop: 0,
          borderRadius: 24,
        }}
        onCancel={() => changeModalState(false)}
        footer={null}
        width={BigModal ? 700 : 480}
      >
        <Tabs 
          defaultActiveKey={state.paneIndex} 
          className={'aggInfo-route-tab'}
          onChange={handlePaneChange}
          tabBarStyle={{
            color: 'white',
          }}
        >
          {
            aggState.routes.map((route: IRecommendRoute, index) => {
              return (
                <Tabs.TabPane tab={upperTitle(route.mode)} key={index} style={{ textTransform: 'capitalize' }}>
                  <div className={'newrouter-wrapper'}>
                    <div className={'newrouter-wrapper-inToken'}>
                      <img src={inToken.icon}/>
                    </div>
                    <div className={'newrouter-wrapper-content'}>
                      {
                        renderNewRoute(route)
                      }
                    </div>
                    <div className={'newrouter-wrapper-outToken'}>
                      <img src={outToken.icon}/>
                    </div>
                  </div>
                </Tabs.TabPane>
              )
            })
          }
        </Tabs>
        <div className={'newrouter-wrapper-btn'}>
          <Button
            onClick={handleSelect}
            style={{
              backgroundColor: '#68E261',
              border: 'none',
              width: 175,
              height: 40,
              borderRadius: 16,
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              fontWeight: 600,
              color: '#0B0B10',
            }}>determine</Button>
        </div>
      </Modal>
    </div>
  );
}


const renderPrice = (inToken: IToken, outToken: IToken, price, key) => {
  return (
    <div className={'agginfo-item-wrapper'} key={key}>
        <div>1 {inToken.symbol}</div>
        <div className={'agginfo-item-wrapper-price'}>{price} {outToken.symbol}</div>
    </div>
  );
}

const renderNewDex = (dexRoute: IDexRoute, index) => {
  const tokenMapText = dexRoute.swapRoutes.map(i => `${i}`).join(' - ');
  return (
    <div key={index + dexRoute.dexName} className={'newrouter-wrapper-content-dex-item'}>
      <div className={'newrouter-wrapper-content-dex'} >
        <div className={'newrouter-wrapper-content-dex-title'}>
          <div className={'newrouter-wrapper-content-dex-token'}>
            {tokenMapText}
          </div>
          <div>{dexRoute.srcRatio}</div>
        </div>
        <div className={'newrouter-wrapper-content-dex-dexName'}>{dexRoute.dexName}</div>
      </div>
      <RightIcon />
    </div>
  )
}

const RightIcon = () => <RightOutlined style={{
    width: 8,
    height: 13,
    color: '#8C8DA2',
  }} />

const renderNewRoute = (routes: IRecommendRoute) => {
  return routes.chainRoutes.map((chainRoute, cIndex) => {
    return (
      <div className={'newrouter-wrapper-content-chain'} key={chainRoute.chainName + cIndex}>
        <div className={'newrouter-wrapper-content-chain-wrapper'}>
          <div className={'newrouter-wrapper-content-chain-title'}>
            <img src={chainRoute.chainIcon} />
            <div>{chainRoute.srcRatio}</div>
          </div>
          <RightIcon />
          <div className={'newrouter-wrapper-content-dex-wrappper'}>
            {

              chainRoute.dexRoutes.map((dexRoutes, index) => {
                return (
                  <div className={'newrouter-wrapper-content-dex-item-wrapper'} key={index}>
                    {dexRoutes.map(renderNewDex)}
                  </div> 
                )           
              })
            }
          </div>
        </div>
      </div>
    )
  })
}