import React from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { Button, InputNumber, Slider, Radio } from 'antd';
import './index.less';
import useConfig from './hook';

export default () => {
  const { config, handleChange, handleReset, handleGoback, handleModeChange } = useConfig();
  const radioSelectStyle = {
    background: '#68E261',
    color: 'black',
    border: 'none',
  };

  return (
    <div className={'setting-wrapper'}>
      <div className={'setting-wrapper-header'}>
        <div className={'setting-wrapper-header-left'}>
          <LeftOutlined onClick={handleGoback} />
          <div className={'setting-wrapper-header-title'}>
            Advanced Settings
          </div>
        </div>
        <Button className={'setting-wrapper-header-reset'} onClick={handleReset} type={'text'} style={{ 
          color: 'white',
          fontFamily: 'Poppins-Medium',
          fontWeight: 400,
          fontSize: 14,
          padding: 0,
        }}>Reset</Button>
      </div>
      <div className={'setting-wrapper-content'}>
        <div className={'setting-wrapper-content-gas'}>
          <div className={'setting-wrapper-content-gas-label'}>Gas Price</div>
          <div className={'setting-wrapper-content-gas-value'}>{`${config.gas} ~ ${config.gas * 13 / 10}`} Gwei</div>
        </div>
        <div className={'setting-wrapper-content-fee'}>
          <div className={'setting-wrapper-content-fee-label'}>Deduction mode</div>
          <div className={'setting-wrapper-content-fee-content'}>
          <Radio.Group 
            onChange={(e) => handleModeChange(e.target.value)} 
            value={config.fee}
            optionType="button"
            buttonStyle={'solid'}
            defaultValue={'desToken'}
          >
            <Radio value={'desToken'} style={config.fee === 'srcToken' ? radioSelectStyle : { border: 'none' }}>srcToken</Radio>
            <Radio value={'sourceToken'} style={config.fee === 'sourceToken' ? radioSelectStyle: { border: 'none' }}>source token</Radio>
          </Radio.Group>
          </div>
        </div>
        <div className={'setting-wrapper-content-time'}>
          <div className={'setting-wrapper-content-time-label'}>Time configuration</div>
          <div className={'setting-wrapper-content-time-content'}>
            <Slider
              min={0}
              max={30}
              step={1}
              value={config.outTime}
              onChange={handleChange}
              style={{
                width: '70%',
              }}
              tipFormatter={(v) => `${v} min`}
            ></Slider>
            <InputNumber
              min={0}
              max={30}
              step={1}
              formatter={v => `${v}  min`}
              parser={value => parseInt(value!.replace('  min', ''))}
              // addonAfter={'min'}
              onChange={handleChange}
              value={config.outTime}
              style={{
                background: '#09090A',
                border: '1px solid #353535',
                color: 'white'
              }}
            ></InputNumber>
          </div>
        </div>
      </div>
    </div>
  )
}