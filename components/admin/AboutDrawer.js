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
          ? 'Mise à jour réussie'
          : 'Erreur lors de la mise à jour',
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
      title={<>Modifier la page</>}
      open={open}
      onClose={() => setOpen(false)}
      width={'70%'}
      extra={
        <button
          className='action-btn success'
          htmltype='submit'
          onClick={writeSpreadsheet}
        >
          Sauvegarder
        </button>
      }
    >
      <h2 className='item-with-icon'>
        A propos de moi{' '}
        <Tooltip title='Ajoutez autant de paragraphes que nécessaire, puis pensez bien à sauvegarder.'>
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
