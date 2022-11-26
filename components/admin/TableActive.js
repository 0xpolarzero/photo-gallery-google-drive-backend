import Image from 'next/image';
import {
  AutoComplete,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faInfoCircle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

export const TableActive = ({
  photos: originPhotos,
  tags: originTags,
  readSpreadsheet: updateData,
}) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(originPhotos);
  const [isMovingRow, setIsMovingRow] = useState(false);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
      title: '',
      description: '',
      tags: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const saveRow = async (key) => {
    try {
      const row = await form.validateFields();

      // If tags is an array, convert it to a string
      if (Array.isArray(row.tags)) {
        row.tags = row.tags.join(',');
      }

      const updateResponseToast = toast.loading(
        'Mise à jour des informations...',
      );
      await updateSpreadsheetRow(key, row)
        .then((res) => {
          toast.update(updateResponseToast, {
            render: 'Informations mises à jour!',
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });
          setEditingKey('');
          updateData();
          return res;
        })
        .catch((err) => {
          toast.update(updateResponseToast, {
            render: 'Erreur lors de la mise à jour.',
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          });
          console.error(err);
        });
    } catch (errInfo) {
      console.log('Erreur de validation:', errInfo);
    }
  };

  const deleteRow = async (key) => {
    const deleteResponseToast = toast.loading('Suppression de la photo...');
    await deleteSpreadsheetRow(key)
      .then((res) => {
        toast.update(deleteResponseToast, {
          render: 'Photo supprimée!',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
        setEditingKey('');
        updateData();
        return res;
      })
      .catch((err) => {
        toast.update(deleteResponseToast, {
          render: 'Erreur lors de la suppression.',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        console.error(err);
      });
  };

  const moveRow = async (index, targetIndex) => {
    setIsMovingRow(true);
    const moveResponseToast = toast.loading('Déplacement de la photo...');
    await moveSpreadsheetRow(index, targetIndex)
      .then((res) => {
        toast.update(moveResponseToast, {
          render: 'Photo déplacée!',
          type: 'success',
          isLoading: false,
          autoClose: 1000,
        });
        setIsMovingRow(false);
        setEditingKey('');
        updateData();
        return res;
      })
      .catch((err) => {
        toast.update(moveResponseToast, {
          render: 'Erreur lors du déplacement.',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        console.error(err);
      });
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'thumbnail',
      width: '0',
      editable: false,
      render: (thumbnail, record) => (
        <img
          src={record.src}
          alt={record.title}
          width={150}
          height={(record.height / record.width) * 150}
        />
      ),
    },
    {
      title: 'Titre',
      dataIndex: 'title',
      width: '0',
      editable: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 'auto',
      editable: true,
    },
    {
      title: () => (
        <span className='item-with-icon'>
          Filtres
          <Tooltip
            title={
              <>
                Séparer les tags par une virgule.
                <br />
                <br />
                Le premier peut être directement sélectionné depuis la liste
                déroulante.
              </>
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'tags',
      width: '20%',
      editable: true,
      render: (tags) => {
        if (tags.length > 0 && tags[0] !== '') {
          return (
            <div className='tags-container'>
              {tags.map((tag) => {
                return (
                  <div className='tag-item' key={tag}>
                    {tag}
                  </div>
                );
              })}
            </div>
          );
        }
        return null;
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '0',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <div className='table-action-btns-modif'>
            <button
              className='action-btn success'
              onClick={() => saveRow(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Sauvegarder
              <br />
            </button>
            <Popconfirm
              title='Annuler les modifications?'
              onConfirm={cancel}
              okText='Oui'
              cancelText='Non'
            >
              <button className='action-btn'>Annuler</button>
            </Popconfirm>
          </div>
        ) : (
          <div className='table-action-btns'>
            <div className='change-container'>
              <button
                className='action-btn'
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
              >
                Modifier
              </button>
              <Popconfirm
                title='Supprimer cette image?'
                onConfirm={() => deleteRow(record.key)}
              >
                <button
                  className='action-btn danger item-with-icon'
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} /> Supprimer
                </button>
              </Popconfirm>
            </div>
            <div className='index-container'>
              <div className='index-arrows'>
                <button
                  className='action-btn arrow item-with-icon'
                  onClick={() =>
                    moveRow(record.index, Number(record.index) + 1)
                  }
                  disabled={
                    record.index === (data.length - 1).toString() || isMovingRow
                  }
                >
                  <FontAwesomeIcon icon={faArrowUp} />
                </button>
                <button
                  className='action-btn arrow item-with-icon'
                  onClick={() =>
                    moveRow(record.index, Number(record.index) - 1)
                  }
                  disabled={record.index === '0' || isMovingRow}
                >
                  <FontAwesomeIcon icon={faArrowDown} />
                </button>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: false,
              },
            ]}
          >
            {/* if its tags and the input in empty */}
            {dataIndex === 'tags' &&
            record[dataIndex].length === 1 &&
            record[dataIndex][0] === '' ? (
              <AutoComplete
                options={originTags.map((tag) => {
                  return {
                    value: tag,
                  };
                })}
              />
            ) : (
              inputNode
            )}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  useEffect(() => {
    setData(originPhotos);
  }, [originPhotos]);

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName='editable-row'
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};

const updateSpreadsheetRow = async (id, row) => {
  const { title, description, tags, index } = row;
  const data = {
    id,
    title,
    description,
    tags,
    index,
  };
  const response = await fetch('/api/write-spreadsheet/update-photos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const deleteSpreadsheetRow = async (id) => {
  const data = {
    id,
    type: 'delete',
  };
  const response = await fetch('/api/write-spreadsheet/delete-restore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const moveSpreadsheetRow = async (originIndex, targetIndex) => {
  const data = {
    originIndex,
    targetIndex,
  };
  const response = await fetch('/api/write-spreadsheet/update-index', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
};
