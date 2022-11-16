import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { getHistoryV2 } from '../../../../../api';
import { ITx } from 'src/components/Main/hooks/useAggHistory';
import { useStore } from '../../../../../hooks/useStore';
import {
  getLocalTxs, 
  changeNetwork,
  withdraw,
  getChainByRouteId,
  msgError,
  notificationTx,
  formatTime,
} from '../../../../../utils';
import { ITxInfo } from '../../../../../interface';
import Txsend from '../../../../../static/img/txsend.png'

export default () => {
  const [state, dispatch] = useStore();
  const { pendingTx, doneTx } = state.history;
  const { account, library } = useWeb3React();
  const [isLoading, setLoading] = useState<boolean>(false);


  const mergeTx = (localTx: ITx[], pendingTx: ITx[], doneTx: ITx[]) => {
    const allTx = new Set([...pendingTx.map(item => item.aggTxHash), ...doneTx.map(item => item.aggTxHash)]);

    return localTx.filter((item) => !allTx.has(item.aggTxHash));
  }
  
  const getHistory = async () => {
    setLoading(true);
    const res = await getHistoryV2(account);
    const localTx = getLocalTxs(account);
    if (!res) return;
    
    // get server data, then format
    const parseNetTx = (item: ITxInfo): ITx => {
      return {
        ...item,
        chainInfo: getChainByRouteId(state.settings, item.chainId),
        formatTime: formatTime(item.blockTime * 1000),
      }
    }
    
    const finishTx = res?.finishedTx?.map(parseNetTx) || [];
    const pendingTx = res?.pendingTx?.map(parseNetTx) || [];

    const localMergeTx = mergeTx(localTx, pendingTx, finishTx);
    pendingTx.unshift(...localMergeTx);
    setLoading(false);

    dispatch({
      type: 'requestNetHistory',
      payload: {
        finishTx,
        pendingTx,
      }
    });
  }

  useEffect(() => {
    if (account) {
      getHistory();
    }
  }, [account]);


  const handleWithDraw = async (tx: ITx) => {
    const { aggId } = tx;

    if (tx.chainInfo.chainId !== library.network.chainId) {
      return changeNetwork(tx.chainInfo.networkInfo);
    }

    if (!aggId || tx.withdrawDeadline * 1000 > Date.now()) {
      return msgError('Not timed out yet');
    }
    try {
      await withdraw(state.selectChain.proxyAddress, state.selectChain.proxyAbi, aggId, library, account);
      notificationTx('withdraw transaction send', 'Transaction send', Txsend);
    } catch (e) {
      msgError(e?.message)
    }
  }

  const handleViewClick = (tx: ITx, type: 'agg' | 'finish' | 'withdraw') => {
    let hash: string;
    if (type === 'agg') {
      hash = tx.aggTxHash;
    } else if (type === 'withdraw') {
      hash = tx.withdrawTxHash;
    } else {
      hash = tx.finishTxHash;
    }

    window.open(`${tx.chainInfo.networkInfo?.blockExplorerUrls[0]}/tx/${hash}`);
  }

  const handleTokenClick = (tx: ITx, type: 'from' | 'out') => {
    const address = type === 'from' ? tx.srcToken.address : tx.desToken.address;
    window.open(`${tx.chainInfo.networkInfo?.blockExplorerUrls[0]}/token/${address}`);
  }

  const handleReloadClick = async () => {
    if (account && !isLoading) {
      await getHistory();
      
      msgError('Reload history success !');
    }
  }
  
  return {
    pendingTx,
    doneTx,
    isLoading,
    handleTokenClick,
    handleViewClick,
    handleWithDraw,
    handleReloadClick,
  }
}
