import { IChainSettings, IRecommendRouteRes, IHistoryTxs, ITokenPrice } from "./interface";
import { msgError } from "./utils";

const requestOrigin = window.location.href.includes('localhost') ? 'http://13.229.203.109' : '';

export const getSettings = async (): Promise<IChainSettings | null> => {
  try {
    const res = await fetch(requestOrigin + '/bridge/chainSettings', {
      method: 'POST'
    });
  
    if (res.ok) {
      const json = await res.json();
      if (json.errCode === 200) {
        return json;
      } else {
        msgError(`get setting error, code: ${json.errCode}, msg: ${json.errMsg}`);
        return null;
      }
    }
  
  } catch (e) {
    console.log(`getSettings error`, e)
  }

  msgError('network error, please try reload page later');

  return null;
}

export const getRecommendRoutes = async (param: {
  chainId: number, srcToken: string, desToken: string, amount: string
}, signal: AbortSignal): Promise<IRecommendRouteRes | null> => {
  try {
    const res = await fetch(requestOrigin + '/agg-algorithm/recommend', {
      method: 'POST',
      body: JSON.stringify(param),
      signal
    });
  
    if (res.ok) {
      const json = await res.json();
      if (json.errCode === 200) {
        return json;
      } else {
        msgError(`get Recommend Routes error, code: ${json.errCode}, msg: ${json.errMsg}`);
        return null;
      }
    }
  } catch (e) {
    if (e.message === 'The user aborted a request.') {
      return null
    }
    console.log(`getRecommendRoutes error`, e);
  }

  msgError('get Recommend Routes error, please try reload later');

  return null;
}

export const getHistoryV2 = async (account: string): Promise<IHistoryTxs | null> => {
  try {
    const res = await fetch(requestOrigin + '/bridge/history', {
      method: 'POST',
      body: JSON.stringify({account})
    });
  
    if (res.ok) {
      const json = await res.json();
      if (json.errCode === 200) {
        return json;
      } else {
        msgError(`get history error, code: ${json.errCode}, msg: ${json.errMsg}`);
      }
    } 
  } catch (e) {
    console.log(`getHistoryV2 error`, e);
  }

  msgError('get history error, please try reload later');

  return null;
}

export const getTokenPirce = async (tokens: string[]): Promise<ITokenPrice[] | null> => {
  try {
    const res = await fetch(requestOrigin + '/agg-algorithm/tokenPrice', {
      method: 'POST',
      body: JSON.stringify({ symbols: tokens })
    });
  
    if (res.ok) {
      const json = await res.json();
      if (json.errCode === 200) {
        return json.tokenPrice;
      } else {
        msgError(`get token price error, code: ${json.errCode}, msg: ${json.errMsg}`);
      }
    }
  } catch (e) {
    console.log(`getTokenPirce error`, e);
  }

  msgError('get token price error, please try reload later');

  return null;
}