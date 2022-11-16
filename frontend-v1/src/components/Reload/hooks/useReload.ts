import { COUNTDOWN_TIME } from '../../../interface';
import { useStore } from '../../../hooks/useStore';
import { useEffect, useRef, useState } from 'react';

export default () => {
  const [state, dispatch] = useStore();
  const { needCountDown, needReload } = state.swap;
  const [count, setCount] = useState<number>(0);
  const intervalId = useRef<number>();
  const clearInterval = () => {
    if (intervalId.current) {
      window.clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }

  const handleClick = () => {
    if (!needCountDown) return;
    clearInterval();
    setCount(0);
    dispatch({
      type: 'needReload',
      payload: {
        needReload: true,
        needCountDown: false,
      },
    });
  }

  /**
   * if need count, start count and remove last count interval
   * countdown time to 0, dispatch reload event, set needCount false, clear interval
   */
  useEffect(() => {
    let isMount = true;

    const startCount = () => {
      intervalId.current = window.setInterval(() => {
        isMount && setCount(count => count + 1);
      }, 1000);
    }

    if (needCountDown) {
      clearInterval();
      isMount && setCount(() => 0);
      startCount();
    } else {
      clearInterval();
    }

    return () => {
      isMount = false;
      clearInterval();
    }
  }, [needCountDown]);

  useEffect(() => {
    if (count === COUNTDOWN_TIME) {
      handleClick();
    }
  }, [count]);

  return {
    percent: count * 100 / COUNTDOWN_TIME,
    needCountDown,
    needReload,
    count: COUNTDOWN_TIME - count,
    handleClick
  }
}