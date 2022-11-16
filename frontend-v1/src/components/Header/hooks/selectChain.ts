
import { useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { changeNetwork, getChainByid } from '../../../utils';
import { useStore } from '../../../hooks/useStore';


export default ({ 
  getItem
}) => {
  const [state, dispatch] = useStore();
  const { selectChain, settings } = state;
  const { chains } = settings;
  const { active, chainId: currentChainId } = useWeb3React();
  const items = useMemo(() => {
    const items = [];
    const nodeItems = [];

    for (const key in chains) {
      items.push(getItem(chains[key].chainSymbol, key, chains[key].chainIcon, 'net', 0));
      nodeItems.push(getItem(chains[key].chainSymbol, key, chains[key].chainIcon, 'node', chains[key].blockHeight));
    }
    return [items, nodeItems];
  }, []);

  const handleSelectChain = async ({ key }) => {
    if (active && chains[key].chainId !== currentChainId) {
      await changeNetwork(chains[key].networkInfo);
    }

    dispatch({
      type: 'updateChain',
      payload: {
        ...chains[key]
      }
    });
  }

  useEffect(() => {
    if (!currentChainId) return;
    if (currentChainId !== selectChain.chainId) {
      const newChain = getChainByid(settings, currentChainId);

      if (!newChain) {
        return;
      }
      
      dispatch({
        type: 'updateChain',
        payload: {
          ...newChain
        }
      });
    }
  }, [currentChainId]);


  return {
    items,
    state: {
      selectChain
    },
    handleSelectChain,
  }
}