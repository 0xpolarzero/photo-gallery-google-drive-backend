import Image from 'next/image';
import styles from '../styles/modules/Home.module.css';
import { useWidth } from '..//hooks/useWidth';
import { PhotoAlbum } from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import { useEffect, useState } from 'react';
import { Collapse, Skeleton } from 'antd';
import { toast } from 'react-toastify';

export const Gallery = () => {
  const [photos, setPhotos] = useState(null);
  const [filteredPhotos, setFilteredPhotos] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [index, setIndex] = useState(-1);
  const [rowHeight, setRowHeight] = useState(300);
  const { type } = useWidth();
  const { Panel } = Collapse;

  // Add 'show-info' class to the photo when it is hovered
  const showInfo = (e) => {
    e.target.parentElement.classList.add('show-info');
  };

  // Remove 'show-info' class from the photo when it is hovered
  const hideInfo = (e) => {
    e.target.parentElement.classList.remove('show-info');
  };

  const getDataFromSpreadsheet = async () => {
    const photosData = await fetch('api/read-spreadsheet/read-photos');
    const photos = await photosData.json();

    if (photosData.status === 200 && photos) {
      // Sort photos by date (newest first)
      const sorted = photos
        .filter((photo) => photo.index !== '-1')
        .sort((a, b) => b.index - a.index);
      setPhotos(sorted);
      setFilteredPhotos(sorted);
    }

    const tagsData = await fetch('api/read-spreadsheet/read-tags');
    const tagsObject = await tagsData.json();

    if (tagsData.status === 200 && tagsObject && tagsObject.length) {
      // Remove empty tags
      const filteredTags = tagsObject[0].tags.filter(
        (tag) => tag !== '' && tag !== ' ',
      );
      setTags(filteredTags);
    }

    return { photoStatus: photosData.status, tagStatus: tagsData.status };
  };

  useEffect(() => {
    getDataFromSpreadsheet().then((res) => {
      if (res.photoStatus !== 200 || res.tagStatus !== 200) {
        console.log('Error fetching data from spreadsheet');
        toast.error(
          'Une erreur a eu lieu pendant le chargement. Veuillez réeessayer.',
        );
      }
    });
  }, []);

  // Set the row height based on the screen width
  useEffect(() => {
    setRowHeight(type === 'small' ? 600 : type === 'medium' ? 450 : 400);
  }, [type]);

  // Filter the photos based on the selected tags
  useEffect(() => {
    if (photos) {
      if (selectedTags.length === 0) {
        setFilteredPhotos(photos);
      } else {
        const fltrPhotos = photos.filter((photo) =>
          selectedTags.every((tag) =>
            photo.tags
              .map((t) => t.replace(/ /g, '').toLowerCase())
              .includes(tag.replace(/ /g, '').toLowerCase()),
          ),
        );
        console.log(fltrPhotos);
        setFilteredPhotos(fltrPhotos);
      }
    } else {
      setFilteredPhotos(null);
    }
  }, [selectedTags]);

  return (
    <main className={styles.main}>
      <div className='filters'>
        <h2>Filtres</h2>
        <div className='filters-tags'>
          {/* Button to reset */}
          <button
            className={
              selectedTags.length === 0 ? 'action-btn selected' : 'action-btn'
            }
            style={{ fontWeight: '700' }}
            onClick={() => setSelectedTags([])}
          >
            Tout afficher
          </button>
          {/* Button for each tag */}
          {tags.length > 0 ? (
            type === 'small' && tags.length > 3 ? (
              <Collapse className='action-btn' bordered={false}>
                <Panel header='Voir les filtres' key='1'>
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        className={
                          isSelected ? 'action-btn selected' : 'action-btn'
                        }
                        // Remove any spaces from the tag
                        data-identifier={tag.replace(/\s/g, '')}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(
                              selectedTags.filter((t) => t !== tag),
                            );
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </Panel>
              </Collapse>
            ) : (
              tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    className={
                      isSelected ? 'action-btn selected' : 'action-btn'
                    }
                    // Remove any spaces from the tag
                    data-identifier={tag.replace(/\s/g, '')}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    {tag}
                  </button>
                );
              })
            )
          ) : null}
        </div>
      </div>
      {!filteredPhotos ? (
        <MultipleSkeletons count={8} />
      ) : filteredPhotos.length === 0 ? (
        <p className='no-photos'>Aucune photo ne correspond à ces critères</p>
      ) : (
        <>
          <PhotoAlbum
            layout='rows'
            photos={filteredPhotos}
            targetRowHeight={rowHeight}
            onClick={(event, photo, index) => setIndex(index)}
            componentsProps={{
              imageProps: {
                loading: 'lazy',
                onPointerEnter: (e) => showInfo(e),
                onPointerLeave: (e) => hideInfo(e),
              },
            }}
            // Render each photo in a div so we can display the overlay
            renderPhoto={({ imageProps }) => {
              const { src, alt, title, sizes, ...restImageProps } = imageProps;
              return (
                <div
                  {...restImageProps}
                  className='photo-container'
                  data-title={title}
                >
                  <img
                    src={src}
                    referrerPolicy='no-referrer'
                    alt={alt}
                    {...restImageProps}
                    style={{ width: '100%', height: '100%' }}
                  />
                  <span className='info-container' data-title={title}></span>
                </div>
              );
            }}
          />

          <Lightbox
            open={index >= 0}
            index={index}
            close={() => setIndex(-1)}
            slides={filteredPhotos}
            plugins={[Captions]}
            render={(photo) => (
              <Image
                fill
                src={photo}
                loading='lazy'
                alt={'alt' in photo ? photo.title : ''}
                title={photo.title}
                sizes={
                  typeof window !== 'undefined'
                    ? `${Math.ceil((photo.width / window.innerWidth) * 100)}vw`
                    : `${photo.width}px`
                }
              />
            )}
          />
        </>
      )}
    </main>
  );
};

const MultipleSkeletons = ({ count }) => {
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push(
      <Skeleton
        key={i}
        active
        title={false}
        avatar={{
          shape: 'square',
          style: { width: '100%', height: 200 },
        }}
        paragraph={false}
      />,
    );
  }
  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fill, minmax(20%, 1fr))',
        gap: 20,
      }}
    >
      {skeletons}
    </div>
  );
};
