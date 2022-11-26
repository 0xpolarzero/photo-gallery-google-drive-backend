import Link from 'next/link';
import styles from '../../styles/modules/Nav.module.css';
import { useWidth } from '../../hooks/useWidth';
import { slide as Menu } from 'react-burger-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsUpDownLeftRight,
  faBars,
  faGear,
  faRightFromBracket,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@auth0/nextjs-auth0';
import { Avatar, Dropdown, Skeleton, Tooltip } from 'antd';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';

export const Nav = ({ theme }) => {
  const { width } = useWidth();

  return (
    <nav className={styles.nav}>
      <div className={styles.nav__logo}>
        <a href='/'>Nils Leprêtre</a>
      </div>
      {width < 768 ? (
        <Menu right customBurgerIcon={<FontAwesomeIcon icon={faBars} />}>
          <NavLinks type='mobile' />
        </Menu>
      ) : (
        <div className={styles.nav__links}>
          <NavLinks type='desktop' theme={theme} />
        </div>
      )}
    </nav>
  );
};

const NavLinks = ({ type, theme }) => {
  const { user, error, isLoading } = useUser();

  return (
    <>
      {type === 'mobile' ? null : (
        <a onClick={theme?.toggle}>
          <span>
            <FontAwesomeIcon
              icon={
                theme ? (theme.current === 'light' ? faSun : faMoon) : faSun
              }
            />
          </span>
        </a>
      )}
      <Link href='/'>
        <span>Galerie</span>
      </Link>
      <Link href='/about'>
        <span>A propos</span>
      </Link>
      {user ? (
        <Profile
          user={user}
          error={error}
          isLoading={isLoading}
          type={type}
          theme={theme}
        />
      ) : null}
    </>
  );
};

const Profile = ({ user, error, isLoading, type }) => {
  console.log();
  const menuItems = [
    {
      label: (
        <Link href='/admin/dashboard' className='item-with-icon'>
          <FontAwesomeIcon icon={faGear} /> Panneau d'administration
        </Link>
      ),
      key: 'dashboard',
    },
    {
      label: (
        <Link href='/admin/move-virtual' className='item-with-icon'>
          <FontAwesomeIcon icon={faArrowsUpDownLeftRight} /> Déplacer les photos
        </Link>
      ),
      key: 'move',
    },
    {
      label: (
        <Link href='/api/auth/logout' className='item-with-icon'>
          <FontAwesomeIcon icon={faRightFromBracket} />
          Déconnexion
        </Link>
      ),
      key: 'logout',
      danger: true,
    },
  ];

  if (isLoading)
    return (
      <Skeleton
        active
        title={false}
        paragraph={false}
        avatar={{ size: 'large' }}
      />
    );

  if (error)
    return (
      <Tooltip title={error.message}>
        <FontAwesomeIcon icon={faUserCircle} />
      </Tooltip>
    );

  if (type === 'mobile') {
    return menuItems.map((item) => item.label);
  }

  return (
    <a className='avatar' style={{ display: 'flex' }}>
      <Dropdown menu={{ items: menuItems }} arrow>
        <Avatar src={user.picture} size={40} style={{ cursor: 'pointer' }} />
      </Dropdown>
    </a>
  );
};
