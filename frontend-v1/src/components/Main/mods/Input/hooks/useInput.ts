import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { useStore } from "../../../../../hooks/useStore";
import { getTokenBalance } from '../../../../../utils';

export default ({ setToken, token }) => {
  const [gobalState] = useStore();
  const { selectChain } = gobalState; 
  const { account, active, library, chainId } = useWeb3React();
  const [state, setState] = useState({
    showSelect: false,
    balance: '0',
  });

  const updateSelectModal = (state: boolean) => {
    setState(pstate => ({
      ...pstate,
      showSelect: state
    }));
  }

  const handleInputChange = (e) => {
    setToken(pstate => ({
      ...pstate,
      value: e.target.value,
    }))
  }

  const handleMaxClick = () => {
    if (state?.balance) {
      setToken(pstate => ({
        ...pstate,
        value: state?.balance
      }));
    }
  }

  useEffect(() => {
    let isMount = true;
    const getUserInfo = async () => {
      if (chainId !== selectChain.chainId) {
        return;
      }
      let balance;
      try {
        balance = await getTokenBalance(token.address, account, library, token.source);
      } catch (e) {
        if (e.message.includes('underlying network changed')) {
          console.log('toggle to testnet, lib provider may not change;')
        } else {
          setToken(null);
        }
      }
      isMount && setState(pstate => ({
        ...pstate,
        balance: balance,
      }));
    }

    if (active && token?.address) {
      // toggle to testnet, lib provider may not change;
      getUserInfo();
      return () => {
        isMount = false;
      }
    }
    if (state.balance !== '0') {
      setState(pstate => ({
        ...pstate,
        balance: '0',
      }));
    }

    return () => {
      isMount = false;
    }
  }, [active, account, token?.address, token?.name, chainId]);

  return {
    state,
    updateSelectModal,
    handleInputChange,
    handleMaxClick,
  }
}