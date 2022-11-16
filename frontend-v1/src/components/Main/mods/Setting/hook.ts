import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect } from "react";
import { useStore } from "../../../../hooks/useStore";

export default () => {
  const [state, dispatch] = useStore();
  const { library } = useWeb3React();

  const handleChange = (v: number) => {
    dispatch({
      type: 'updateConfig',
      payload: {
        outTime: v
      }
    });
  }

  const handleReset = () => {
    dispatch({
      type: 'resetConfig',
    });
  }

  const handleGoback = () => {
    dispatch({
      type: 'updateConfigShow',
      payload: false,
    })
  }

  const handleModeChange = (mode: string) => {
    dispatch({
      type: 'updateMode',
      payload: mode
    })
  }

  useEffect(() => {
    if (library) {
      let isMount = true;
      const getGasPrice = async () => {
        const feeData = await library.getFeeData();
  
        if (isMount) {
          dispatch({
            type: 'updateConfig',
            payload: {
              gas: parseFloat(ethers.utils.formatUnits(feeData.gasPrice, 'gwei')).toFixed(2)
            }
          })
        }
      }
      getGasPrice();
      const key = setInterval(async () => {
        getGasPrice(); 
      }, 5000);
      return () => {
        isMount = false;
        clearInterval(key);
      }
    }
  }, [library]);

  return {
    config: state.config,
    handleChange,
    handleReset,
    handleGoback,
    handleModeChange,
  }
}