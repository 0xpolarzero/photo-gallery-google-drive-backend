import Link from 'next/link';
import { useWidth } from '../../hooks/useWidth';
import { useSortable } from '@dnd-kit/sortable';
import clsx from 'clsx';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { PhotoAlbum } from 'react-photo-album';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Skeleton } from 'antd';
import { toast } from 'react-toastify';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';

// ---------------------------------------------------------------- //
// Sortable gallery

const PhotoFrame = memo(
  forwardRef((props, ref) => {
    const {
      layoutOptions,
      imageProps,
      overlay,
      active,
      insertPosition,
      attributes,
      listeners,
    } = props;
    const { alt, style, ...restImageProps } = imageProps;

    return (
      <div
        ref={ref}
        style={{
          width: overlay
            ? `calc(100% - ${2 * layoutOptions.padding}px)`
            : style.width,
          padding: style.padding,
          marginBottom: style.marginBottom,
        }}
        className={`photo-container ${clsx('photo-frame', {
          overlay: overlay,
          active: active,
          insertBefore: insertPosition === 'before',
          insertAfter: insertPosition === 'after',
        })}`}
        {...attributes}
        {...listeners}
        data-identifier={props.photo.id}
      >
        <img
          loading='lazy'
          referrerPolicy='no-referrer'
          alt={alt}
          style={{
            ...style,
            width: '100%',
            height: '100%',
            padding: 0,
            marginBottom: 0,
          }}
          {...restImageProps}
        />
      </div>
    );
  }),
);
PhotoFrame.displayName = 'PhotoFrame';

const SortablePhotoFrame = (props) => {
  const { photo, activeIndex } = props;
  const { attributes, listeners, isDragging, index, over, setNodeRef } =
    useSortable({ id: String(photo.id) });

  return (
    <PhotoFrame
      ref={setNodeRef}
      active={isDragging}
      insertPosition={
        activeIndex !== undefined && over?.id === photo.id && !isDragging
          ? index > activeIndex
            ? 'after'
            : 'before'
          : undefined
      }
      aria-label='sortable image'
      attributes={attributes}
      listeners={listeners}
      {...props}
    />
  );
};

export default function MoveVirtual() {
  const [rawPhotos, setRawPhotos] = useState([]);
  const [photos, setPhotos] = useState(rawPhotos);
  const [rowHeight, setRowHeight] = useState(300);
  const { type } = useWidth();
  const { error, isLoading } = useUser();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    ({ active }) => setActiveId(active.id),
    [],
  );
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPhotos((photos) => {
        const oldIndex = photos.findIndex(
          (item) => String(item.id) === active.id,
        );
        const newIndex = photos.findIndex(
          (item) => String(item.id) === over.id,
        );
        return arrayMove(photos, oldIndex, newIndex);
      });
    }
  }, []);

  const [activeId, setActiveId] = useState(null);
  const activeIndex = activeId
    ? photos.findIndex((photo) => photo.id === activeId)
    : undefined;

  const renderedPhotos = useRef({});
  const renderPhoto = useCallback(
    (props) => {
      // capture rendered photos for future use in DragOverlay
      renderedPhotos.current[props.photo.id] = props;
      return <SortablePhotoFrame activeIndex={activeIndex} {...props} />;
    },
    [activeIndex],
  );

  // ---------------------------------------------------------------- //
  // Systems

  const readSpreadsheet = async () => {
    const photosRes = await fetch('/api/read-spreadsheet/read-photos');
    const photosData = await photosRes.json();

    if (photosData) {
      setRawPhotos(
        photosData
          .filter((photo) => photo.index !== '-1')
          .sort((a, b) => b.index - a.index),
      );
    }
  };

  const savePhotoPositions = async () => {
    let sortedPhotos = [];
    const domPhotos = document.querySelectorAll('.photo-container');
    domPhotos.forEach((photo, index) => {
      const id = photo.getAttribute('data-identifier');
      sortedPhotos.push({ id, index });
    });

    const sortToast = await toast.loading('Saving positions...');
    const res = await fetch('/api/write-spreadsheet/sort', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sortedPhotos),
    });
    const data = await res.json();
    toast.update(sortToast, {
      render: data.status === 200 ? 'Saved!' : 'Error saving the positions',
      type: data.status === 200 ? 'success' : 'error',
      isLoading: false,
      autoClose: 3000,
    });
  };

  useEffect(() => {
    readSpreadsheet();
  }, []);

  useEffect(() => {
    setPhotos(rawPhotos);
  }, [rawPhotos]);

  useEffect(() => {
    setRowHeight(type === 'small' ? 600 : type === 'medium' ? 450 : 400);
  }, [type]);

  if (isLoading)
    return (
      <div className='admin'>
        <Skeleton active />
      </div>
    );

  if (error) return <div className='admin'>{error.message}</div>;

  return (
    <div className='admin'>
      <div className='header'>
        <h2>Move photos</h2>
        <div className='buttons' style={{ display: 'flex', gap: '1rem' }}>
          <button className='action-btn'>
            <Link href='/admin/dashboard' className='item-with-icon'>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to the dashboard
            </Link>
          </button>
          <button className='action-btn success' onClick={savePhotoPositions}>
            Save
          </button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photos}>
          <div>
            <PhotoAlbum
              layout='rows'
              photos={photos}
              targetRowHeight={rowHeight}
              componentsProps={{
                imageProps: {
                  loading: 'lazy',
                },
              }}
              renderPhoto={renderPhoto}
            />
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId && (
            <PhotoFrame overlay {...renderedPhotos.current[activeId]} />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export const getServerSideProps = withPageAuthRequired();
