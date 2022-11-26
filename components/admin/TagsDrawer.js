import { EditableCellTags, EditableRowTags } from './utils/Editable';
import { Drawer, Popconfirm, Skeleton, Table, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import {
  faAdd,
  faInfoCircle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

export const TagsDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  tags,
  photos,
  readSpreadsheet: updateDashboard,
}) => {
  const [filteredTags, setFilteredTags] = useState(null);
  const [tagsHistory, setTagsHistory] = useState([]);
  const [tagsCount, setTagsCount] = useState(0);
  const [photoCountPerTag, setPhotoCountPerTag] = useState(0);

  const defaultcolumns = [
    {
      title: () => (
        <div className='item-with-icon'>
          Filtre
          <Tooltip
            title={
              <>
                Click on a tag to edit it.
                <br />
                <br />
                It will be applied to all photos with the same tag.
              </>
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'tag',
      key: 'tag',
      editable: true,
    },
    {
      title: 'Photos count',
      dataIndex: 'count',
      key: 'count',
      editable: false,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '0',
      render: (_, record) =>
        filteredTags.length >= 1 ? (
          <Popconfirm
            title='Are you sure to delete this tag?'
            onConfirm={() => handleDelete(record)}
          >
            <button
              className='action-btn danger item-with-icon'
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                padding: '0.5rem 1rem',
              }}
            >
              <FontAwesomeIcon icon={faTrash} /> Delete
            </button>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleDelete = (record) => {
    const newTags = filteredTags.filter((tag) => tag.key !== record.key);
    setFilteredTags(newTags);

    // Reflect in the history that the tag has been deleted
    // so we can later update the spreadsheet and remove it for all photos
    if (record.count > 0) {
      const newTagsHistory = [...tagsHistory];
      newTagsHistory.push({
        key: record.key,
        tag: filteredTags.filter((tag) => tag.key === record.key)[0].tag,
        action: 'delete',
      });
      setTagsHistory(newTagsHistory);
    }
  };

  const handleAdd = () => {
    const newTag = {
      key: tagsCount,
      // Add tag with empty space so it can be clicked on, not using just a space
      // because it would be trimmed
      tag: 'New tag',
      count: 0,
    };
    setFilteredTags([...filteredTags, newTag]);
    setTagsCount(tagsCount + 1);
  };

  const handleSave = (row) => {
    // Check if the tag doesn't already exist
    const tagAlreadyExists = filteredTags.filter(
      (tag) =>
        tag.tag.trim().toLowerCase() === row.tag.trim().toLowerCase() &&
        tag.key !== row.key,
    );
    if (tagAlreadyExists.length > 0) {
      toast.error('Tag already exists.');
      return;
    }

    // Change the tag
    const newTags = [...filteredTags];
    const index = newTags.findIndex((item) => row.key === item.key);
    const item = newTags[index];
    newTags.splice(index, 1, { ...item, ...row });
    setFilteredTags(newTags);

    // When a tag is edited and has at least one photo, we add it to the history
    // This way we can update the tag in the spreadsheet for all photos
    if (row.count > 0) {
      const newHistory = [...tagsHistory];
      const index = newHistory.findIndex((item) => row.key === item.key);
      if (index === -1) {
        newHistory.push({
          key: row.key,
          oldTag: item.tag,
          newTag: row.tag,
          action: 'edit',
        });
      } else {
        newHistory[index].newTag = row.tag;
      }
      setTagsHistory(newHistory);
    }

    // Replace the tag in the count, so it pretends to be updated
    const newPhotoCountPerTag = { ...photoCountPerTag };
    const oldTag = Object.keys(photoCountPerTag).find(
      (tag) => tag.replace(/\s/g, '') === item.tag.replace(/\s/g, ''),
    );
    newPhotoCountPerTag[row.tag.replace(/\s/g, '')] =
      newPhotoCountPerTag[oldTag];
    delete newPhotoCountPerTag[oldTag];
    setPhotoCountPerTag(newPhotoCountPerTag);
  };

  const handleSubmit = async () => {
    // Check if there are no duplicate tags
    const tags = filteredTags.map((tag) => tag.tag.trim().toLowerCase());
    const duplicateTags = tags.filter(
      (tag, index) => tags.indexOf(tag) !== index,
    );
    if (duplicateTags.length > 0) {
      toast.error('Duplicate tags.');
      return;
    }

    // Update the spreadsheet
    const updateToast = toast.loading('Updating tags...');
    const response = await fetch('/api/write-spreadsheet/update-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filteredTags,
        tagsHistory,
      }),
    });
    const data = await response.json();
    const isSuccess =
      data.cellRes.status === 200 && data.rowsRes.status === 200;

    toast.update(updateToast, {
      render: isSuccess ? 'Tags updated!' : 'Error updating tags.',
      type: isSuccess ? 'success' : 'error',
      isLoading: false,
      autoClose: 3000,
    });

    if (isSuccess) {
      setIsDrawerOpen(false);
      updateDashboard();
    }
  };

  const components = {
    body: {
      row: EditableRowTags,
      cell: EditableCellTags,
    },
  };

  const mergedColumns = defaultcolumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputtype: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editable: col.editable,
        handleSave,
      }),
    };
  });

  useEffect(() => {
    if (tags) {
      // Format tags to be used in the table
      const filtered = tags.filter((tag) => tag !== '' && tag !== ' ');
      setFilteredTags(filtered.map((tag, index) => ({ key: index, tag })));
      setTagsCount(filtered.length);

      // Count the number of photos for each tag
      const filteredPhotos = photos.map((photo) => ({
        ...photo,
        tags: photo.tags.map((tag) => tag.trim()),
      }));

      const tagsCount = {};
      filteredPhotos.forEach((photo) => {
        photo.tags.forEach((tag) => {
          if (tagsCount[tag]) {
            tagsCount[tag]++;
          } else {
            tagsCount[tag] = 1;
          }
        });
      });
      setPhotoCountPerTag(tagsCount);
    }
  }, [tags, photos]);

  return (
    <Drawer
      title='Tags'
      open={isDrawerOpen}
      onOk={() => setIsDrawerOpen(false)}
      onClose={() => setIsDrawerOpen(false)}
      width={'50%'}
      destroyOnClose={true}
      extra={
        <button className='action-btn success' onClick={handleSubmit}>
          Save
        </button>
      }
    >
      {!filteredTags ? (
        <Skeleton active title={false} paragraph={{ rows: 4 }} />
      ) : filteredTags.length === 0 ? (
        <>
          <p>No tags found.</p>
          <br />
          <button className='action-btn item-with-icon' onClick={handleAdd}>
            <FontAwesomeIcon icon={faAdd} />
            Add tag
          </button>
        </>
      ) : (
        <>
          <button className='action-btn item-with-icon' onClick={handleAdd}>
            <FontAwesomeIcon icon={faAdd} />
            Add tag
          </button>
          <br />
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={filteredTags.map((tag) => ({
              ...tag,
              count: photoCountPerTag[tag.tag.trim()] || 0,
            }))}
            columns={mergedColumns}
          />
        </>
      )}
    </Drawer>
  );
};
