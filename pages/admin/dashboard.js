import Link from 'next/link';
import { TableActive } from '../../components/admin/TableActive';
import { TableDeleted } from '../../components/admin/TableDeleted';
import { UploadDrawer } from '../../components/admin/UploadDrawer';
import { TagsDrawer } from '../../components/admin/TagsDrawer';
import { Skeleton } from 'antd';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faFilter,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';

export default function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState([]);
  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [isTagsDrawerOpen, setIsTagsDrawerOpen] = useState(false);
  const { error, isLoading } = useUser();

  const readSpreadsheet = async () => {
    const photosRes = await fetch('/api/read-spreadsheet/read-photos');
    const photosData = await photosRes.json();

    if (photosData) {
      setPhotos(
        photosData
          .filter((photo) => photo.index !== '-1')
          .sort((a, b) => b.index - a.index),
      );
      setDeletedPhotos(photosData.filter((photo) => photo.index === '-1'));

      // Check if there are any photos without height or width > 0
      const photosWithoutHeightOrWidth = photosData.filter(
        (photo) => photo.height === '0' || photo.width === '0',
      );
      if (photosWithoutHeightOrWidth.length > 0) {
        toast.error(
          `Il y a ${photosWithoutHeightOrWidth.length} photos sans hauteur ou largeur. Cela peut causer des problèmes d'affichage.`,
        );
      }
    }

    const tagsRes = await fetch('/api/read-spreadsheet/read-tags');
    const tagsData = await tagsRes.json();
    if (tagsData) {
      setTags(tagsData[0].tags);
    }
  };

  useEffect(() => {
    readSpreadsheet();
  }, []);

  if (isLoading)
    return (
      <div className='admin'>
        <Skeleton active />
      </div>
    );

  if (error) return <div className='admin'>{error.message}</div>;

  return (
    <div className='admin'>
      <div className='actions'>
        <button
          className='action-btn item-with-icon'
          onClick={() => setIsUploadDrawerOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} /> ADD PHOTOS
        </button>
        <button
          className='action-btn item-with-icon'
          onClick={() => setIsTagsDrawerOpen(true)}
        >
          <FontAwesomeIcon icon={faFilter} />
          Edit filters
        </button>
      </div>
      {!!photos && photos.length > 0 ? (
        <>
          <div className='header'>
            <h2 style={{ margin: 0 }}>Photos</h2>
            <button className='action-btn'>
              <Link href='/admin/move-virtual' className='item-with-icon'>
                Move in the gallery <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </button>
          </div>
          <TableActive
            photos={photos}
            tags={tags}
            readSpreadsheet={readSpreadsheet}
          />
        </>
      ) : (
        <p>No photo yet.</p>
      )}
      {!!deletedPhotos && deletedPhotos.length > 0 ? (
        <>
          <h2 style={{ margin: 0 }}>Deleted</h2>
          <TableDeleted
            photos={deletedPhotos}
            readSpreadsheet={readSpreadsheet}
          />
        </>
      ) : (
        <p>No deleted photo yet.</p>
      )}
      <TagsDrawer
        isDrawerOpen={isTagsDrawerOpen}
        setIsDrawerOpen={setIsTagsDrawerOpen}
        tags={tags}
        photos={photos}
        readSpreadsheet={readSpreadsheet}
      />
      <UploadDrawer
        isDrawerOpen={isUploadDrawerOpen}
        setIsDrawerOpen={setIsUploadDrawerOpen}
        readSpreadsheet={readSpreadsheet}
      />
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();
