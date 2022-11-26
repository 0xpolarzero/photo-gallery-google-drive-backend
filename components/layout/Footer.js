import styles from '../../styles/modules/Home.module.css';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span className='item-with-icon' style={{ marginLeft: '0.5rem' }}>
        <FontAwesomeIcon icon={faCopyright} /> Nils Leprêtre 2022
      </span>
    </footer>
  );
};
