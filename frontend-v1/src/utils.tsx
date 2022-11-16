import { message, notification } from "antd";
import { ContractTransaction, ethers } from 'ethers';
import React from "react";
import { ITx } from "./components/Main/hooks/useAggHistory";
import {
  ERC20_ABI, 
  agg_abi, 
  IChain, 
  Local_history_prefix, 
  IChainSettings, 
  IRecommendRoute, 
  ITxType,
  IToken
} from "./interface";
import Unsupport from './static/img/unsupport.png';
import { CheckOutlined } from "@ant-design/icons";
import CloseIcon from './static/img/close.png';


export function isAddress(value: string) {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export function combineReducers(reducers) {  
  return (state = {}, action) => {
    const newState = {};
    for (let key in reducers) {
      newState[key] = reducers[key](state[key], action);
    }
    return newState;
  }
}

export const parseAccount = (account: string) => {
  if (typeof account === 'string') {
    return account.substr(0, 6) + '....' + account.substr(-4);
  }
  msgError('parse account error');
  return account;
}

export const changeNetwork = async (netWorkInfo: any) => {
  if (!(window as any).ethereum) {
    alert('No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.')
    throw ('no window.ethereum');
  }
  try {
    if (
      netWorkInfo.chainId === '0x1' || 
      netWorkInfo.chainId === '0x4' || 
      netWorkInfo.chainId === '0x5' ||
      netWorkInfo.chainId === '0x2a' 
    ) {
      await (window as any).ethereum.request({ method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: netWorkInfo.chainId
          },
        ],
      });
    } else {
      await (window as any).ethereum.request({ method: 'wallet_addEthereumChain', params: [netWorkInfo]});
    }
  } catch (e) {
    msgError(`Failed to switch network: ${netWorkInfo.chainName}, please check local network`)
    throw `connect error, netWorkInfo: ${netWorkInfo.chainId}, ${JSON.stringify(e)}`;
  }
}

export const getERC20Decimals = async (address: string, library) => {
  const contract = getContract(address, ERC20_ABI, library);

  return await contract.decimals();
}

export const getBalance = async (library, account, decimals = 18) => {
  let balance = await library?.getBalance(account);
  return balance ? (balance / Math.pow(10, decimals)).toFixed(4) : balance;
}

export const getContract = (address: string, abi, library) => {
  return new ethers.Contract(address, abi, library)
}

export const getTokenBalance = async (tokenAddress: string, account: string, library, source = false) => {
  if (!isAddress(tokenAddress) || !isAddress(account)) {
    throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`)
  }

  if (!source) {
    const contract = getContract(tokenAddress, ERC20_ABI, library);
    let balance 
    try {
      balance = await contract.balanceOf(account);
    } catch (e) {
      e.code = 'ERROR_CODES.getTokenBalance';
      throw e;
    }

    return parseFloat(ethers.utils.formatUnits(balance, await contract.decimals())).toFixed(4);
  } else {
    return await getBalance(library, account);
  }
}


export const getERC20Allowance = async (contractAddress: string, provider, owner: string, spender: string) => {
  const contract = getContract(contractAddress, ERC20_ABI, provider);
  const decimals = await contract.decimals();
  const allowance = await contract.allowance(owner, spender);

  return allowance / Math.pow(10, decimals);
}

export const erc20Approve = async (contractAddress: string, provider, owner: string, spender: string, amount = ethers.constants.MaxUint256.toString()) => {
  const contract = getContract(contractAddress, ERC20_ABI, provider);
  const contractWithSigner = contract.connect(provider.getSigner(owner));
  return contractWithSigner.approve(spender, amount);
}

export const withdraw = async (contractAddress: string, abi: ethers.ContractInterface, aggId: number, provider, account: string) => {
  const contract = getContract(contractAddress, abi, provider);
  const signer = provider.getSigner(account);
  const contractWithSigner = contract.connect(signer);
  const tx = await contractWithSigner.withdraw(aggId);

  await tx.wait();
}

export const parseLog = (abi, logs) => {
  const iface = new ethers.utils.Interface(abi);
  return logs.map((log) => {
    try {
      return iface.parseLog(log)
    } catch (e) {
      return null;
    }
  })
}

export const parseAgglogs = (logs, abi) => {
  return parseLog(abi, logs);
}

export const getTransaction = async (hash: string, provider, count = 1) => {
  const etherTx = await provider.getTransaction(hash);
  if (!etherTx) {
    return new Promise((resolve) => {
      if (count > 3) return null;
      count ++;
      setTimeout(() => {
        resolve(getTransaction(hash, provider, count));
      }, count * 1000)
    })
  }

  return etherTx;
}

export const awaitFinishTxReady = async (contractAddrss, abi, aggid: number, provider): Promise<any> => {
  return new Promise((resolove, reject) => {
    console.log('subscribe event ------------', aggid);
    const contract = getContract(contractAddrss, abi, provider);
    contract.on('Finish', (aggId: ethers.BigNumber, fromCount: ethers.BigNumber, toCount: ethers.BigNumber, tx) => {
      const resAggId = aggId.toNumber();
      console.log("get finish event", resAggId, aggid, tx);
      if (aggid === resAggId) {
        contract.removeAllListeners();
        resolove({
          aggid: resAggId,
          fromCount,
          toCount,
          transactionHash: tx.transactionHash
        });
      }
      resolove(null);
    });
  });
}

/**
 * search old history tx, check input aggid is completed;
 * @param aggid 
 * @param chainName 
 * @param provider 
 * @param tsc 
 * @param currentBlock 
 * @returns 
 */
export const getFinishTxhash = async (aggid: number, address: string, provider, tsc: ContractTransaction, abi): Promise<null | string> => {
  const iface = new ethers.utils.Interface(agg_abi);
  const filter = {
    address,
    fromBlock: tsc.blockNumber,
    toBlock: 'latest',
    topics: [ iface.getEventTopic('Finish') ]
  }

  const logs = await provider.getLogs(filter);
  const events = parseAgglogs(logs, abi);
  if (events.length) {
    const index = events.findIndex(item => item?.args?.[0].toNumber() === aggid);
    return logs[index]?.transactionHash;
  }
  return null;
}

export const awaitAggEntryTxReady = async (tsc: ContractTransaction, type: ITxType, abi) => {
  const rpt = await tsc.wait();
  const events = parseAgglogs(rpt.logs, abi);

  if (type === 'local') {
    const localEvent = events.find(item => item?.name === 'AggregateExecLocal');
    return {
      rpt,
      outCount: localEvent?.args?.totalDesAmount || 0
    };
  } else {
    const event = events.find(item => item?.name === 'AggregateExec');
    let aggId: number;
    if (event) {
      aggId = event.args.aggregateID.toNumber();
    }
    return {
      events,
      rpt,
      aggId,
      totalLocalDesAmount: event?.args?.totalLocalDesAmount || 0
    }
  }
}

export const setLocalItem = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const getLocalItem = (key: string) => {
  const str = window.localStorage.getItem(key);
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return str
  }
}

export const setLocalTx = (account: string, tx: ITx) => {
  const key = Local_history_prefix + account;
  const txs = getLocalItem(key) || [];
  txs.unshift(tx);
  if (txs.length > 3) txs.length = 3;

  setLocalItem(key, txs);
}

export const removeLocalTx = (account: string, tx: ITx) => {
  const key = Local_history_prefix + account;
  const txs = getLocalItem(key) || [];
  const index = txs.findIndex(item => item.aggTxHash === tx.aggTxHash);
  if (index > -1) {
    txs.splice(index, 1);
    setLocalItem(key, txs);
  }
}

export const getLocalTxs = (account: string) => {
  const key = Local_history_prefix + account;
  return getLocalItem(key) || [];
}

export const getProvider = (chain: IChain) => {
  if (chain.chainId === 4) {
    return ethers.getDefaultProvider('rinkeby');
  }

  if (chain.chainId === 42) {
    return ethers.getDefaultProvider('kovan');
  }

  if (chain.chainId === 5) {
    return ethers.getDefaultProvider('goerli');
  }

  return new ethers.providers.StaticJsonRpcProvider(chain.networkInfo.rpcUrls[0])
}

export const getChainByname = (settings: IChainSettings, chainName: string) => {
  return settings.chains.find(item => item.chainName === chainName);
}

export const getChainByid = (settings: IChainSettings, chainId: number) => {
  return settings.chains.find(item => item.chainId === chainId);
}

export const getChainByRouteId = (settings: IChainSettings, routeId: number) => {
  return settings.chains.find(item => item.platformChainId === routeId);
}

export const getSupportChainIds = (settings: IChainSettings) => {
  return settings.chains.map(item => item.chainId);
}

export const getChainTokens = (settings: IChainSettings, chainId: number): IToken[] => {
  const chainPair = settings.chainPairs.find(item => item.chainId === chainId);

  if (chainPair) {
    return chainPair.tokens;
  }

  return [];
}

export const getGasPrice = async (library) => {
  const blockNumber = await library.getBlockNumber();

  const prices = [];
  let i = 0;
  while (i < 20) {
    const tx = await library.getBlockWithTransactions(blockNumber - i);
    prices.push(ethers.utils.formatUnits(tx.transactions[0].gasPrice, 'gwei'))
    i++;
  }
}

export const sendSwapTransaction = async (
  recommendRoute: IRecommendRoute, 
  chain: IChain, 
  library, 
  account: string, 
  deadline: number, 
  source: boolean, 
  amount: string,
  feeMode: number,
) => {
  const contract = getContract(chain.proxyAddress, chain.proxyAbi, library);
  const signer = library.getSigner(account);
  const contractWithSigner = contract.connect(signer);

  let tx;
  if (source) {
    tx = await contractWithSigner.aggregateEntry(
      {
        srcToken: recommendRoute.srcToken,
        desToken: recommendRoute.desToken,
        deadline,
        dexIDs: recommendRoute.dexIds,
        routes: recommendRoute.routes,
        amounts: recommendRoute.amount,
        feeMode 
      },
      {
        value: ethers.utils.parseEther(amount)
      }
    )
  } else {
    tx = await contractWithSigner.aggregateEntry(
      {
        srcToken: recommendRoute.srcToken,
        desToken: recommendRoute.desToken,
        deadline,
        dexIDs: recommendRoute.dexIds,
        routes: recommendRoute.routes,
        amounts: recommendRoute.amount,
        feeMode
      },
    )
  }

  return tx
}

export const msgError = (msg: string) => {
  message.error({
    content: (
      <div className={'global-message-errro'}>
        <img src={Unsupport} className={'global-message-errro-icon'} />
        {msg}
      </div>
    ),
    icon: <img />,
    prefixCls: 'smooswap',
    style: {
      display: 'flex',
      position: 'absolute',
      top: '76px',
      width: '100vw',
    },
  });
}

export const notificationTx = (msg: string, title: string, icon?) => {
  const key = Date.now() + msg;
  notification.open({
    message: <div style={{ display: 'none' }}></div>,
    description: (
      <div style={{
        textAlign: 'center',
        marginTop: -12,
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 18,
          fontFamily: 'Poppins-Medium',
          fontWeight: '500',
          color: '#FFFFFF',
        }}>{title}</div>
        <div style={{
          width: 100,
          height: 100,
          border: '3px solid #68E261',
          borderRadius: '50%',
          display: "flex",
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 46,
        }}>
          {
            icon ?
              <img style={{
                width: 21,
                height: 30,
              }} src={icon} />
            :
              <CheckOutlined style={{
                width: 30,
                height: 30,
                fontSize: '30px',
                color: 'rgb(104, 226, 97)'
              }} />
          }
        </div>
        <div style={{
          marginTop: 28,
        }}>{msg}</div>
        <div style={{
          width: 355,
          height: 50,
          background: 'rgb(104, 226, 97)',
          borderRadius: 24,
          margin: '35px auto 10px',
          fontSize: 16,
          fontWeight: 600,
          color: '#0B0B10',
          lineHeight: '50px',
          cursor: 'pointer',
          fontFamily: 'Poppins-Medium',
        }} onClick={() => notification.close(key)}>Close</div>
      </div>
    ),
    style: {
      background: '#1B1D1F',
      border: '1px solid #303336',
      borderRadius: 24,
      fontSize: 14,
      fontFamily: 'Poppins-Medium',
      fontWeight: '500',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    key,
    closeIcon: <img src={CloseIcon} className={'smoo-close-btn'}/>,
    duration: 50
  });
}

export const formatTime = (time: number) => {
  const d = new Date(time);
  return d.toLocaleString();
}

export const upperTitle = (s: string) => {
  if (s) {
    return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
  }
  return null
}