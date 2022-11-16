import { useState } from 'react';
import { useStore } from '../../../../hooks/useStore';

type IState = {
  showModal: boolean,
  paneIndex: string
}

export default (changeSelectRouteIndex) => {
  const { selectChain } = useStore()[0];
  const [state, setState] = useState<IState>({
    showModal: false,
    paneIndex: '0',
  });

  const changeModalState = (modalState: boolean) => {
    setState(pstate => ({
      ...pstate,
      showModal: modalState,
    }));
  }

  const handlePaneChange = (index: string) => {
    setState(pstate => ({
      ...pstate,
      paneIndex: index,
    }));
  }

  const handleSelect = () => {
    changeModalState(false);
    changeSelectRouteIndex(parseInt(state.paneIndex));
  }

  return {
    state,
    selectChain,
    changeModalState,
    handlePaneChange,
    handleSelect,
  }
}