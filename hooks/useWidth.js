import { useEffect, useState } from 'react';

export const useWidth = () => {
  const [width, setWidth] = useState(null);

  useEffect(() => {
    setWidth(window.innerWidth);

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    type: width < 768 ? 'small' : width < 1024 ? 'medium' : 'large',
  };
};
