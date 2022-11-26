import { Divider, Drawer } from 'antd';
import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

export const UploadDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  readSpreadsheet,
}) => {
  const FOLDER_URL =
    'https://drive.google.com/drive/folders/1kHSatX8MoYiJBit3KHZwrqymOFrwJ0y1';

  const writeSpreadsheet = async () => {
    const updateToast = toast.loading('Mise à jour de la feuille de calcul...');
    await fetch('/api/write-spreadsheet/update-photos')
      .then(async (res) => {
        toast.update(updateToast, {
          render: 'Feuille de calcul mise à jour!',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
        readSpreadsheet();
        return res.json();
      })
      .catch((err) => {
        toast.update(updateToast, {
          render: 'Erreur lors de la mise à jour.',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        console.error(err);
      });
  };

  return (
    <Drawer
      title='Ajouter photos'
      open={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      width={'70%'}
    >
      <div className='upload-instructions'>
        <div>
          <b>1. Téléchargez les photos sur Google Drive.</b>
          <a href={FOLDER_URL} target='_blank' rel='noopener noreferrer'>
            <button className='action-btn item-with-icon'>
              <InboxOutlined /> Ouvrir le dossier Google Drive
            </button>
          </a>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <b>2. Rafraichir la feuille de calcul.</b>
          <a>
            <button
              className='action-btn item-with-icon'
              onClick={writeSpreadsheet}
            >
              <ReloadOutlined /> Mettre à jour la feuille de calcul
            </button>
          </a>
        </div>
        <Divider />
        <div>
          <b>Formats autorisés:</b>
          <ul>
            <li>JPG</li>
            <li>JPEG</li>
            <li>PNG</li>
            <li>GIF</li>
            <li>BMP</li>
            <li>WEBP</li>
            <li>TIFF</li>
          </ul>
        </div>
      </div>
    </Drawer>
  );
};
