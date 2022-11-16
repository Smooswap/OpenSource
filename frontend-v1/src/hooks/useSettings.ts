import { IChainSettings, Action } from "../interface";

export const settingInitState: IChainSettings = null;

export const settingReducer = (state, action: Action) => {
  switch (action.type) {
    case 'updateSettings':
      return {
        ...action.payload
      };
    default:
      return state;
  }
}