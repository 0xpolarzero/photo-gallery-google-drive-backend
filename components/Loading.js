import { useRouter } from 'next/router';
import styles from '../styles/modules/Loading.module.css';
import { useEffect, useState } from 'react';

export const Loading = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url) =>
      url !== router.asPath ? setLoading(true) : null;
    const handleComplete = (url) =>
      url === router.asPath ? setLoading(false) : null;

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return loading ? (
    <div className={styles.loader}>
      <div className={styles.loader__spinner}></div>
    </div>
  ) : (
    <div className={styles.loader__done}></div>
  );
};
