
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { 
  InjectedConnector, 
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector';
import north from '../../../../config/north.config';
import { Button, message, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import Unsupport from '../../../static/img/unsupport.png';
// import { CHAIN, getChainByid, supportedChainIds } from '../../../interface';
import { 
  changeNetwork, 
  getBalance, 
  getChainByname, 
  getChainByid, 
  getSupportChainIds, 
  parseAccount,
  msgError,
} from '../../../utils';

type IState = {
  accountMsg: string,
  balanceMsg: string,
  showModal: boolean,
  connecting: boolean,
  showAccount: boolean,
}

declare const window: any;

const notificationKey = 'unsupport key';

export default ({ chainName }) => {
  const [state, setState] = useState<IState>({
    accountMsg: 'Connect Wallet',
    balanceMsg: '',
    showModal: false,
    connecting: false,
    showAccount: false,
  });
  const { active, error, account, activate, library, chainId: currentChainId, deactivate } = useWeb3React();
  const { settings } = useStore()[0];

  const handleClick = async () => {
    if (!active && !state.connecting) {
      setState(pstate => ({
        ...pstate,
        connecting: true,
      }));
      try {
        await changeNetwork(getChainByname(settings, chainName).networkInfo);
        const injected = new InjectedConnector({ supportedChainIds: getSupportChainIds(settings) });
        await activate(injected);
      } catch (e) {
        console.log(e)
      }

      setState(pstate => ({
        ...pstate,
        connecting: false,
        showModal: false,
      }));
    }
  }

  const changeModalState = (state: boolean) => {
    if (state && active) {
      return;
    }
    setState(pstate => ({
      ...pstate,
      showModal: state
    }));
  }

  const changeAccountState = (state: boolean) => {
    if (!active && state) return;
    setState(pstate => ({
      ...pstate,
      showAccount: state
    }));
  }

  useEffect(() => {
    const updateUserInfo = async () => {
      let value = '';
      if (active) {
        const balance = await getBalance(library, account);
        const chainInfo = getChainByid(settings, currentChainId);
        value = `${balance} ${chainInfo?.networkInfo.nativeCurrency.symbol}`
      }
      
      setState(pstate => ({
        ...pstate,
        accountMsg: active ? parseAccount(account) : 'Connect Wallet',
        balanceMsg: value
      }))
    }

    updateUserInfo();
  }, [active, account, currentChainId]);

  useEffect(() => {
    if (currentChainId === getChainByname(settings, chainName).chainId) {
      notification.close(notificationKey);
    }
  }, [currentChainId]);

  useEffect(() => {
    let msg = '';
    if (!error) return;
    console.log(error, 'NoEthereumProviderError')
    if (error instanceof NoEthereumProviderError) {
      msg = 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
    } else if (error instanceof UnsupportedChainIdError) {
      msg = "You're connected to an unsupported network."
      notification.error({
        key: notificationKey,
        message: (
          <div className={'unsupport-wrapper'}>
            <div className={'unsupport-wrapper-left'}>
              <img src={Unsupport} className={'unsupport-wrapper-icon'}/>
              {msg}
            </div>
            <Button style={{
              position: 'absolute',
              right: 8,
              width: '145px',
              height: '32px',
              background: '#68E261',
              borderRadius: '16px',
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              fontWeight: 500,
              color: '#0B0B10',
              border: 'none',
            }} type="primary" onClick={handleClick}>Change Network</Button>
          </div>
        ),
        style: {
          width: 720,
          height: 48,
          background: 'rgb(104, 226, 97, .2)',
          borderRadius: 18,
          position: 'relative',
          top: 50,
        },
        duration: 0,
        placement: 'top',
        icon: <img />,
        closeIcon: <img />,
      });
      return;
    } else if (
      error instanceof UserRejectedRequestErrorInjected
    ) {
      msg = 'Please authorize this website to access your Ethereum account.'
    } else {
      msg = 'An unknown error occurred. Check the console for more details.'
    }
    notification.error({
      key: notificationKey,
      message: (
        <div className={'unsupport-wrapper'}>
          <div className={'unsupport-wrapper-left'}>
            <img src={Unsupport} className={'unsupport-wrapper-icon'}/>
            {msg}
          </div>
        </div>
      ),
      style: {
        width: 720,
        height: 48,
        background: 'rgb(104, 226, 97, .2)',
        borderRadius: 18,
        position: 'relative',
        top: 50,
      },
      duration: 0,
      placement: 'top',
      icon: <img />,
    });
  }, [error]);

  useEffect(() => {
    const getAccount = async () => {
      try {
        const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
        if (accounts?.length) {
          const injected = new InjectedConnector({ supportedChainIds: getSupportChainIds(settings) });
          await activate(injected);
        }
      } catch (e) {
        console.log(e);
      }
    }
    const init = async () => {
      if (window.ethereum?.isConnected()) {
        getAccount();
      } else {
        window.ethereum?.on('connect',  () => {
          getAccount();
        });
      }
    }

    init();
  }, []);

  const handleCopy = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(account);
      message.success('Copy success!');
    } catch (e) {
      console.log(e)
      msgError('copy error');
    }
  }

  const handleView = () => {
    if (!active) return;
    const info = getChainByname(settings, chainName).networkInfo;

    if (info?.blockExplorerUrls?.[0]) {
      window.open(`${info?.blockExplorerUrls?.[0]}/address/${account}`);
    }
  }

  const handleLogout = () => {
    if (!active) return;

    changeAccountState(false);
    deactivate();
  }

  useEffect(() => {
    if (account) {
      north.sendLog(`account change: ${account}`);
      north.setTag('account', account);
    }
  }, [account]);

  return {
    account,
    state,
    settings,
    handleClick,
    changeAccountState,
    changeModalState,
    handleCopy,
    handleView,
    handleLogout,
  }
}