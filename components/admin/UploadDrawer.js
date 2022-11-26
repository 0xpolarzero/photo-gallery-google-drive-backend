import { Divider, Drawer } from 'antd';
import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

export const UploadDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  readSpreadsheet,
}) => {
  const FOLDER_URL =
    'https://drive.google.com/drive/folders/1YTv0TAqylMwOHT9D7dCg3OvBL_ZsApN9';

  const writeSpreadsheet = async () => {
    const updateToast = toast.loading('Updating spreadsheet...');
    await fetch('/api/write-spreadsheet/update-photos')
      .then(async (res) => {
        toast.update(updateToast, {
          render: 'Spreadsheet updated!',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
        readSpreadsheet();
        return res.json();
      })
      .catch((err) => {
        toast.update(updateToast, {
          render: 'Error updating spreadsheet.',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        console.error(err);
      });
  };

  return (
    <Drawer
      title='Add Photos'
      open={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      width={'70%'}
    >
      <div className='upload-instructions'>
        <div>
          <b>1. Upload photos to Google Drive</b>
          <a href={FOLDER_URL} target='_blank' rel='noopener noreferrer'>
            <button className='action-btn item-with-icon'>
              <InboxOutlined /> Open folder
            </button>
          </a>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <b>2. Update the spreadsheet</b>
          <a>
            <button
              className='action-btn item-with-icon'
              onClick={writeSpreadsheet}
            >
              <ReloadOutlined /> Update spreadsheet
            </button>
          </a>
        </div>
        <Divider />
        <div>
          <b>Accepted formats</b>
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
