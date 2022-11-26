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
      <h2 style={{ marginBottom: 0 }}>Panneau d'administration</h2>
      <div className='admin-greeting'>
        Bienvenue sur le panneau d'administration, <b>{user.nickname}</b>.
      </div>
      <div className='admin-links'>
        <Divider orientation='left'>Gestion des photos</Divider>
        <span>
          <b>Modifier les informations</b> des photos (titre, description,
          filtres), en <b>ajouter</b> ou en <b>supprimer</b>.
        </span>
        <Link href='/admin/dashboard'>
          <button className='action-btn item-with-icon'>
            <FontAwesomeIcon icon={faGear} /> Gérer les photos et tags
          </button>
        </Link>
        <Divider orientation='left' style={{ marginTop: '2rem' }}>
          Organisation de la galerie
        </Divider>
        <span>
          Pour <b>modifier l'ordre des photos</b> dans la galerie.
        </span>
        <Link href='/admin/move-virtual'>
          <button className='action-btn item-with-icon'>
            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} /> Organiser la
            galerie
          </button>
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();
