import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react"
import { getLocalItem, setLocalItem, getTokenBalance } from "../../../../../utils";
import { useStore } from "../../../../../hooks/useStore";
import { Collect_Tokens_Key, IToken } from "../../../../../interface";

type IState = {
  collectTokens: IToken[];
  supportTokens: IToken[];
}

export default ({ setToken, type, otherToken, updateSelectModal }) => {
  const { selectChain, settings } = useStore()[0];
  const key = Collect_Tokens_Key + selectChain.chainName;
  const { account, library, active } = useWeb3React();

  const getSelectTokens = (): IToken[]  => {
    const chainPair = settings.chainPairs.find(item => item.chainId === selectChain.chainId);

    if (chainPair) {
      if (!otherToken) {
        return chainPair.tokens;
      }
      const supprotTokens = [];
      chainPair.pairs.every(item => {
        let adr = '';
        if (item.token0 === otherToken.address) {
          adr = item.token1;
        } else if (item.token1 === otherToken.address) {
          adr = item.token0;
        }

        const token = chainPair.tokens.find(item => item.address === adr);
        if (token) {
          supprotTokens.push({
            ...token,
          });
        }
        return true;
      });
      return supprotTokens;
    }

    return [];
  }
  
  const [state, setState] = useState<IState>({
    collectTokens: otherToken?.address ? [] : getLocalItem(key) || [],
    supportTokens: getSelectTokens(),
  });

  const handleSelect = (token: IToken, type: 'tag' | 'list') => {
    setToken(pstate => ({
      ...pstate,
      ...token,
      value: pstate?.value || 1
    }));
    updateSelectModal(false);

    if (type === 'list') {
      const collectTokens = [...(getLocalItem(key) || [])];

      const index = collectTokens.findIndex(item => item.address === token.address);

      if (index === -1) {
        collectTokens.unshift(token);

        if (collectTokens.length > 5) 
          collectTokens.length = 5;
        setLocalItem(key, collectTokens);
      }
    }
  }

  const handleReset = () => {
    setToken(null);
    updateSelectModal(false);
  }

  useEffect(() => {
    let isUnmounted = false;
    const getTokensBalance = async () => {
      if (active) {
        const tokens = [...state.supportTokens];
  
        for (let token of tokens) {
          token.balance = await getTokenBalance(token.address, account, library, token.source);
          if (!isUnmounted) 
            setState(pstate => ({
              ...pstate,
              supportTokens: [...tokens],
            }));
        }
      }
    }
    getTokensBalance();

    return () => {
      isUnmounted = true;
    }
  }, [state.supportTokens.length]);

  useEffect(() => {
    setState(pstate => ({
      ...pstate,
      collectTokens: otherToken?.address ? [] : getLocalItem(key) || [],
      supportTokens: getSelectTokens(),
    }));
  }, [selectChain.chainName]);

  return {
    state,
    handleSelect,
    handleReset
  };
}