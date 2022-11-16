import { removeLocalTx, setLocalTx } from '../../../utils';
import { IChain, ITxType } from '../../../interface';
import { ITokenAmount } from './useSwap';
import { Transaction } from 'ethers';

export type ITx = {
  // hash: string,
  aggTxHash: string,
  chainInfo: IChain,
  type: ITxType,
  desToken: ITokenAmount,
  srcToken: ITokenAmount,
  aggId?: number,
  etherTx?: Transaction,
  finishTxHash?: string,
  blockNumber?: number,
  withdrawDeadline: number,
  withdrawTxHash: string,
  expectAmount?: string,
  blockTime: number,
  formatTime?: string,
}

export type IState = {
  pendingTx: ITx[],
  doneTx: ITx[]
}

export const historyInitState: IState = {
  pendingTx: [],
  doneTx: [],
}

export const AggReducer = (state: IState, action) => {
  console.log('------handle agg action', action.type, action)
  const { type, payload } = action;
  if (!type) throw 'action error, no type';
  const newPendingTx = [...state.pendingTx];
  switch (type) {
    case 'createTx':
      newPendingTx.unshift(action.payload)
      setLocalTx(payload.account, payload);
      return {
        ...state,
        pendingTx: newPendingTx,
      };
    case 'requestNetHistory':
      return {
        ...state,
        pendingTx: payload.pendingTx,
        doneTx: payload.finishTx
      }
    case 'aggCrossChainEntryFinish':
      // corss chain tx entry tx finish & get agg id
      const { txHash, aggId } = payload;
      const item = newPendingTx.find(item => item.aggTxHash === txHash)
      if (!item) {
        return state;
      }
      item.aggId = aggId
      return {
        ...state,
        pendingTx: newPendingTx,
      };
    case 'pendingTxFinish':
      const index = newPendingTx.findIndex(item => item.aggTxHash === payload.aggTxHash);
      removeLocalTx(payload.account, payload);
      if (index === -1) {
        console.warn("can't find pending tx, may udapte");
        return state;
      }
      const updateTx = newPendingTx.splice(index, 1);
      state.doneTx.unshift({
        ...updateTx,
        ...payload
      });
      return {
        ...state,
        pendingTx: newPendingTx
      }
    default: 
      return state;
  }
}
