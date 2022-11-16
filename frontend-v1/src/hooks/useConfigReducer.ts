export type IConfigIintState = {
  outTime: number,
  fee: 'srcToken' | 'sourceToken',
  gas: number,
  showConfig: boolean,
}

export const configIintState: IConfigIintState = {
  outTime: 20,
  fee: 'srcToken',
  gas: 0,
  showConfig: false,
}

export const configReducer = (state, action) => {
  switch (action.type) {
    case 'updateConfig':
      return {
        ...state,
        ...action.payload
      }
    case 'updateConfigShow':
      return {
        ...state,
        showConfig: action.payload
      }
    case 'updateMode':
      return {
        ...state,
        fee: action.payload
      }
    case 'resetConfig':
      return {
        ...configIintState,
        gas: state.gas,
        showConfig: state.showConfig,
      }
    default:
      return state;
  }
}