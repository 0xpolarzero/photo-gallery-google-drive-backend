import { uploadToFirebase } from '../../data/uploadToFirebase';
import { getFirebaseFiles } from '../../data/getFirebaseStorage';
import { formatSize } from '../../utils/formatSize';
import { Drawer, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

export const UploadDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  readSpreadsheet,
}) => {
  const [fileList, setFileList] = useState([]);
  const [availableSpace, setAvailableSpace] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);
  const { Dragger } = Upload;

  const uploadProps = {
    name: 'file',
    multiple: true,
    directory: false,
    accept: '.jpg, .jpeg, .png, .gif, .webp, .bmp',

    beforeUpload: async (file) => {
      // Don't allow directories
      if (file.size === '' || file.size === 0) {
        toast.error("L'upload ne supporte pas les dossiers");
        return Upload.LIST_IGNORE;
      }

      let fileListSize = getTotalSize(fileList);
      // If it exceeds the max size, don't add the last file
      if (fileListSize + file.size > MAX_SIZE) {
        toast.error(`Dépasse la limite de ${formatSize(MAX_SIZE)}`);
        return Upload.LIST_IGNORE;
      } else {
        setTotalSize(fileListSize + file.size);
        setFileList([...fileList, file]);
        toast.info(`${file.name} ajouté`, {
          position: 'bottom-left',
        });
      }
    },

    onRemove: (file) => {
      setTotalSize(getTotalSize(fileList) - file.size);
      setFileList(fileList.filter((f) => f.uid !== file.uid));
      toast.info(`${file.name} supprimé`, {
        position: 'bottom-left',
      });
    },
  };

  const getTotalSize = (files) => {
    if (files.length === 0) return 0;
    return files.reduce((acc, file) => acc + file.size, 0);
  };

  const getAvailableSpace = async () => {
    const files = await getFirebaseFiles();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    setAvailableSpace(MAX_SIZE - totalSize);
  };

  const handleSubmit = async () => {
    // Don't allow empty uploads
    if (fileList.length === 0) {
      toast.error('Aucun fichier sélectionné');
      return;
    }

    // Just make sure the user doesn't try to upload more than the max size
    const available = await getAvailableSpace();
    if (totalSize > available) {
      toast.error(`Dépasse la limite de ${formatSize(availableSpace)}`);
      return;
    }

    // Start isUploading
    setIsUploading(true);
    const uploadedFiles = await uploadToFirebase(fileList);
    toast.success('Upload terminé');

    // Update the spreadsheet
    const updated = await updateSpreadsheet();

    // Reset state
    setFileList([]);
    setTotalSize(0);
    setIsUploading(false);

    if (updated) {
      setIsDrawerOpen(false);
      readSpreadsheet();
    } else {
      setIsUploadError(true);
      toast.error(
        'Vous pouvez redemander une mise à jour en cliquant sur le bouton "Mettre à jour"',
      );
    }
  };

  const updateSpreadsheet = async () => {
    const updateToast = toast.loading('Mise à jour de la feuille de calcul...');
    const res = await fetch('/api/write-spreadsheet/update-photos');

    if (res.status === 200) {
      toast.update(updateToast, {
        render: 'Feuille de calcul mise à jour!',
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      getAvailableSpace();
    }
  });

  return (
    <Drawer
      title='Ajouter photos'
      open={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      width={'70%'}
      extra={
        <div className='form-btns' style={{ display: 'flex', gap: '1rem' }}>
          <button
            className='action-btn'
            onClick={updateSpreadsheet}
            disabled={isUploading || !isUploadError}
          >
            Mettre à jour
          </button>
          <button
            className='action-btn'
            htmltype='submit'
            onClick={handleSubmit}
            disabled={isUploading}
          >
            Uploader
          </button>
        </div>
      }
    >
      <Dragger
        {...uploadProps}
        fileList={fileList}
        action={false}
        customRequest={({ onSuccess }) =>
          setTimeout(() => {
            onSuccess('ok', null);
          }, 0)
        }
        style={{ maxHeight: 400 }}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>Cliquer ou glisser des fichiers ici</p>
        <p className='ant-upload-hint'>
          {formatSize(totalSize)} / {formatSize(availableSpace)}
        </p>
        <p>
          Les fichiers doivent être au format JPG, JPEG, PNG, BMP, GIF ou WEBP.
        </p>
        <p>Ils seront ajoutés au Drive et à la feuille de calcul.</p>
      </Dragger>
    </Drawer>
  );
};
