import Link from 'next/link';
import {
  faArrowsUpDownLeftRight,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Skeleton } from 'antd';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';

export default function Admin() {
  const { user, error, isLoading } = useUser();

  if (isLoading)
    return (
      <div className='admin'>
        <Skeleton active />
      </div>
    );

  if (error) return <div className='admin'>{error.message}</div>;

  return (
    <div className='admin'>
      <h2 style={{ marginBottom: 0 }}>Admin dashboard</h2>
      <div className='admin-greeting'>
        Welcome to your dashboard, <b>{user.nickname}</b>.
      </div>
      <div className='admin-links'>
        <Divider orientation='left'>Manage photos</Divider>
        <span>
          <b>Update photos informations</b> (title, description, tags),{' '}
          <b>add</b> or <b>delete</b> photos.
        </span>
        <Link href='/admin/dashboard'>
          <button className='action-btn item-with-icon'>
            <FontAwesomeIcon icon={faGear} /> Manage photos & tags
          </button>
        </Link>
        <Divider orientation='left' style={{ marginTop: '2rem' }}>
          Organize gallery
        </Divider>
        <span>
          To <b>arrange the photos</b> in the gallery.
        </span>
        <Link href='/admin/move-virtual'>
          <button className='action-btn item-with-icon'>
            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} /> Move images
          </button>
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();
