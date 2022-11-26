import Head from 'next/head';
import styles from '../styles/modules/Home.module.css';
import '../styles/index.css';
import { Nav } from '../components/layout/Nav';
import { Footer } from '../components/layout/Footer';
import { ConfigProvider, theme } from 'antd';
import { UserProvider } from '@auth0/nextjs-auth0';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';

function MyApp({ Component, pageProps }) {
  const [userTheme, setUserTheme] = useState('light');

  const toggleTheme = () => {
    if (userTheme === 'light') {
      setUserTheme('dark');
    } else {
      setUserTheme('light');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', userTheme);
  }, [userTheme]);

  useEffect(() => {
    const osTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    if (osTheme) setUserTheme(osTheme);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Nils Lepretre</title>
        <meta
          name='description'
          content='Page photo personnelle de Nils Lepretre'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <ConfigProvider
        theme={{
          algorithm:
            userTheme === 'light'
              ? theme.defaultAlgorithm
              : theme.darkAlgorithm,
        }}
      >
        <UserProvider>
          <Nav theme={{ toggle: toggleTheme, current: userTheme }} />
          <Component {...pageProps} />
        </UserProvider>
        <Footer />
        <Loading />
      </ConfigProvider>
      <ToastContainer theme={userTheme} position='bottom-right' />
    </div>
  );
}

export default MyApp;
