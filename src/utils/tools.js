import { useState, useEffect, useRef } from 'react';

export const useInterval = (callback, delay) => {
    const intervalRef = useRef();
    const callbackRef = useRef(callback);
  
    // Remember the latest callback:
    //
    // Without this, if you change the callback, when setInterval ticks again, it
    // will still call your old callback.
    //
    // If you add `callback` to useEffect's deps, it will work fine but the
    // interval will be reset.
  
    useEffect(() => {
      callbackRef.current = callback;
    }, [callback]);
  
    // Set up the interval:
  
    useEffect(() => {
      if (typeof delay === 'number') {
        intervalRef.current = window.setInterval(() => callbackRef.current(), delay);
  
        // Clear interval if the components is unmounted or the delay changes:
        return () => window.clearInterval(intervalRef.current);
      }
    }, [delay]);
    
    // Returns a ref to the interval ID in case you want to clear it manually:
    return intervalRef;
}

export const scrollToBottom = (element) => {
    const mainCardElement = document.getElementById(element);
    mainCardElement.scrollTop = mainCardElement.scrollHeight;
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}