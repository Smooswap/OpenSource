import React from 'react';
import { Menu, Dropdown, Button, MenuProps, Modal } from 'antd';
import useSelectChain from './hooks/selectChain';
import { LoadingOutlined } from '@ant-design/icons';
import './index.less';
import useConnect from './hooks/useConnect';
import HeaderLog from '../../static/img/HeaderLog.png';
import WalletPng from '../../static/img/wallet.png';
import MetaMaskPng from '../../static/img/metamaskBg.png';
import NodeSetting from '../../static/img/nodeSetting.png';
import Copy from '../../static/img/copy.png';
import View from '../../static/img/view.png';
import Logout from '../../static/img/logout.png';
import { Trade_Header_Left_Route_Path } from '../../interface';
import DropdownPng from '../../static/img/downout.png';
import CloseIcon from '../../static/img/close.png';


type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: string,
  type?: 'node' | 'net',
  blockHeight?: number,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon: <img className={'header-icon'} src={icon} />,
    children,
    label: 
      <div className={'header-icon-label-wrapper'}>
        <div className={'header-icon-label'}>{label}</div>
        {
          type === 'net' ?
          <div className={'header-icon-angel'}/>
          :
          <div className={'header-icon-right'}>
            <div>{blockHeight}</div>
            <div className={'header-icon-angel'}/>
          </div>
        }
      </div>,
  } as MenuItem;
}

export default () => {
  const { items, state: selectState, handleSelectChain } = useSelectChain({ getItem });
  const { 
    handleClick, 
    state: connectState, 
    changeModalState,
    changeAccountState,
    handleCopy,
    handleView,
    handleLogout,
  } = useConnect({ chainName: selectState.selectChain.chainName });

  return (
    <div className={'header-wrapper'}>
      <div className={'header-wrapper-left'}>
        <img src={HeaderLog} className={'header-wrapper-left-logo'} />
        <div className={'header-wrapper-left-list'}>
          {
            Object.entries(Trade_Header_Left_Route_Path).map(([key, value], index) => {
              return (
                <div key={key + index}>{key}</div>
              );
            })
          }
        </div>
      </div>
      <div className={'header-wrapper-controls'}>
      <Dropdown
         overlay={
          <Menu
            className={'header-menu'}
            theme={'dark'}
            style={{
              width: 233,
              padding: '8px',
              background: '#000000',
              borderRadius: 6,
            }}
            selectedKeys={[selectState.selectChain.chainName]}
            items={[{
              key: '1',
              type: 'group',
              label: 'Node Settings',
              children: items?.[1],
            }]}
            onClick={handleSelectChain}
          />
        } placement="bottomLeft">
          <div className={'header-wrapper-nodeSet'}>
            <img  src={NodeSetting} />
          </div>
        </Dropdown>
        <Dropdown
         overlay={
          <Menu
            className={'header-menu'}
            theme={'dark'}
            style={{
              width: 233,
              padding: '8px',
              background: '#000000',
              borderRadius: 6,
            }}
            selectedKeys={[selectState.selectChain.chainName]}
            items={[{
              key: '1',
              type: 'group',
              label: 'Select Network',
              children: items?.[0],
            }]}
            onClick={handleSelectChain}
          />
        } placement="bottomLeft">
          <Button 
            className={'header-btn'} 
            icon={<img className={'header-btn-icon'} 
            src={selectState.selectChain.chainIcon}/>}
            style={{
              fontWeight: 500,
              width: 120,
              height: '36px',
              borderRadius: '6px !important',
              color: 'white',
              fontFamily: 'Poppins-Medium',
              background: 'linear-gradient(90deg, #7A4ADE, #582BB9)',
            }}
          >
            {selectState.selectChain.chainName}
            <img src={DropdownPng} style={{ width: 12, height: 7, marginLeft: 8 }} />
          </Button>
        </Dropdown>
        <div
          onClick={() => changeModalState(true)} 
          className={'header-btn header-connect'}
        >
          <div className={'header-connect-wrapper'} onClick={() => changeAccountState(true)}>
            {
              connectState.balanceMsg ?
                <>
                  <div className={'header-connect-balance'}>{connectState.balanceMsg}</div>
                </>
              :
                <img className={'header-btn-icon'} src={WalletPng} />
            }
            <div className={`${connectState.balanceMsg ? 'header-connect-account' : ''}`}>
              {connectState.accountMsg}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title={'Connect Wallet'}
        visible={connectState.showModal}
        className={'header-connect-modal header-connect-wallet-wrapper'}
        onCancel={() => changeModalState(false)}
        centered
        bodyStyle={{
          backgroundColor: '#131516',
        }}
        closeIcon={<img className={'smoo-close-btn'} src={CloseIcon} />}
        footer={null}
      >
        {
          connectState.connecting ?
          <div className={'header-connect-loading'}>
            <LoadingOutlined style={{ fontSize: 30 }} />
            <div className={'header-connect-loading-text'}>Connecting</div>
          </div>
          :
          <div className={'header-connect-wallet'} onClick={handleClick}>
            <div>MetaMask</div>
            <img src={MetaMaskPng} className={'header-connect-wallet-icon'} />
          </div>
          }
      </Modal>
      <Modal
        title={'Account'}
        visible={connectState.showAccount}
        centered
        onCancel={() => changeAccountState(false)}
        footer={null}
        closeIcon={<img className={'smoo-close-btn'} src={CloseIcon} />}
        className={'header-connect-modal header-account-wrapper'}
        bodyStyle={{
          backgroundColor: '#131516',
          padding: 0,
        }}
      >
        <div className={'header-account-wrapper-content'}>
          <div className={'header-account-wrapper-content-header'}>
            <div className={'header-account-wrapper-content-header-left'}>
              <div className={'header-account-wrapper-content-header-left-account'}>
                <img src={MetaMaskPng} />
                <div>{connectState.accountMsg}</div>
              </div>
              <img onClick={handleCopy} src={Copy}  style={{ margin: '0 16px' }}/>
              <img onClick={handleView} src={View} />
            </div>
            <div className={'header-account-wrapper-content-header-right'}>
              <img onClick={handleLogout} src={Logout} />
            </div>
          </div>
          <div className={'header-account-wrapper-content-balance-title'}>Balance</div>
          <div className={'header-account-wrapper-content-balance'}>{connectState.balanceMsg}</div>
        </div>
      </Modal>
    </div>
  )
}