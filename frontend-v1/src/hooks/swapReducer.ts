export type ISwapInitState = {
  needCountDown: boolean,
  needReload: boolean,
}

export const swapInitState: ISwapInitState = {
  needCountDown: false,
  needReload: false,
}

export const swapReducer = (state, action) => {
  switch (action.type) {
    case 'needReload':
      return {
        ...state,
        ...action.payload
      }
    case 'needCountDown':
      return {
        ...state,
        ...action.payload
      }
    default:
      return state;
  }
}