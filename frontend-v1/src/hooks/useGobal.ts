import { useEffect } from "react";
import { getSettings } from '../api';

export const useGobal = (dispatch) => {
  const init = async () => {
    const res = await getSettings();
    if (res) {

      dispatch({
        type: 'updateSettings',
        payload: {
          chainPairs: res.chainPairs,
          chains: res.chains,
          defaultChain: res.defaultChain
        },
      });

      dispatch({
        type: 'updateDefaultChain',
        payload: res.defaultChain,
      });
    }
  }
  useEffect(() => {
     init();
  }, []);
}