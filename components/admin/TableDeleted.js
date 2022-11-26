import Image from 'next/image';
import { Form, Input, InputNumber, Table } from 'antd';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

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
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export const TableDeleted = ({
  photos: originPhotos,
  readSpreadsheet: updateData,
}) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(originPhotos);

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

  const restoreRow = async (key) => {
    const restoreResponseToast = toast.loading('Restoring photo...');
    await restoreSpreadsheetRow(key)
      .then((res) => {
        toast.update(restoreResponseToast, {
          render: 'Photo restored',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
        setEditingKey('');
        updateData();
        return res;
      })
      .catch((err) => {
        toast.update(restoreResponseToast, {
          render: 'Error restoring photo',
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
        <Image
          src={`https://lh4.googleusercontent.com/u/0/d/${record.id}`}
          alt={record.title}
          width={150}
          height={(record.height / record.width) * 150}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 'min-content',
      editable: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 'auto',
      editable: true,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      width: 'min-content',
      editable: true,
    },
    {
      title: 'Index',
      dataIndex: 'index',
      width: 'min-content',
      editable: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '0',
      render: (_, record) => {
        return (
          <div className='table-action-btns'>
            <button
              className='action-btn success'
              onClick={() => restoreRow(record.key)}
            >
              Restore
            </button>
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

const restoreSpreadsheetRow = async (id) => {
  const data = {
    id,
    type: 'restore',
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
