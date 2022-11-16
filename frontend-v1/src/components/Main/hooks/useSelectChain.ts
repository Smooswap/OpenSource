import { IChain } from '../../../interface';
import north from '../../../../config/north.config';

export const chainInitState: IChain | null  = null;

export const selectChainReducer = (state, action) => {
  switch (action.type) {
    case 'updateChain':
      if (state) {
        north.sendLog(`update chain ${state?.chainId} to ${action?.payload?.chainId}`);
        return {
          ...state,
          ...action.payload
        }
      }

      return action.payload;

    case 'updateDefaultChain':
      return action.payload;
    default:
      return state
  }
}