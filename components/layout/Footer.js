import styles from '../../styles/modules/Home.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span className='item-with-icon' style={{ marginLeft: '0.5rem' }}>
        by{' '}
        <a
          href='https://polarzero.xyz'
          target='_blank'
          rel='noopener noreferrer'
        >
          polarzero
        </a>
      </span>
    </footer>
  );
};
