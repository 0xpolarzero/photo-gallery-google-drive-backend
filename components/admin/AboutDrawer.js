import { Drawer, Input, Skeleton, Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const AboutDrawer = ({ open, setOpen, content, updateAbout }) => {
  const [value, setValue] = useState(null);
  const { TextArea } = Input;

  const setInitialContent = () => {
    if (content) {
      setValue(content.join('\n'));
    } else {
      setValue(['']);
    }
  };

  const writeSpreadsheet = async () => {
    const updateToast = toast.loading('Mise à jour en cours...');
    const res = await fetch('/api/write-spreadsheet/update-about', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });
    const data = await res.json();

    toast.update(updateToast, {
      render:
        data.status === 200
          ? 'Update successful'
          : 'Error updating spreadsheet',
      type: data.status === 200 ? 'success' : 'error',
      isLoading: false,
      autoClose: 5000,
    });

    if (data.status === 200) {
      updateAbout();
      setOpen(false);
    }
  };

  useEffect(() => {
    setInitialContent();
  }, [content]);

  return (
    <Drawer
      title={<>Edit page</>}
      open={open}
      onClose={() => setOpen(false)}
      width={'70%'}
      extra={
        <button
          className='action-btn success'
          htmltype='submit'
          onClick={writeSpreadsheet}
        >
          Save
        </button>
      }
    >
      <h2 className='item-with-icon'>
        About me{' '}
        <Tooltip title='This is the content of the about page. Add as much content as you want, but do not forget to save!'>
          <FontAwesomeIcon icon={faInfoCircle} style={{ height: 16 }} />
        </Tooltip>
      </h2>
      {value !== null ? (
        <TextArea
          placeholder='Ecrire ici'
          autoSize={{ maxRows: 30 }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoSave='true'
        />
      ) : (
        <Skeleton active title={false} paragraph={{ rows: 4 }} />
      )}
    </Drawer>
  );
};
