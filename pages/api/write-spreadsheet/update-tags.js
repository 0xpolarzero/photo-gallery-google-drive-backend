import { backupSpreadsheet } from '../../../data/backupSpreadsheet';
import { sheets, SHEET_ID } from '../../../data/getGoogleApiClient';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(function handler(req, res) {
  return new Promise((resolve, reject) => {
    main(req.body)
      .then((data) => {
        res.status(200).json(data);
        resolve();
      })
      .catch((err) => {
        res.status(500).json(err);
        reject(err);
      });
  });
});

async function updateTagsInCell(tags) {
  // Remove any duplicates or empty strings
  const uniqueTags = [...new Set(tags)].filter((tag) => tag);
  // Separate the tags with a comma
  const tagsString = uniqueTags.join(',');
  // Update the cell
  const request = {
    spreadsheetId: SHEET_ID,
    range: 'K2',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[tagsString]],
    },
  };
  const response = await sheets.spreadsheets.values.update(request);

  return response;
}

async function updateTagsInRows(history) {
  // Get the rows to update (at the tags column)
  const getRequest = {
    spreadsheetId: SHEET_ID,
    range: 'E2:E',
    valueRenderOption: 'FORMATTED_VALUE',
  };
  const getResponse = await sheets.spreadsheets.values.get(getRequest);
  const rows = getResponse.data.values;

  if (rows && rows.length) {
    const newRows = rows.map((row) => {
      // If the row is empty, no need to do anything
      if (!row[0]) return row;

      let tags = row[0].split(',');
      // Map through the history
      history.forEach((item) => {
        // If the tag has been marked as deleted, remove it
        if (item.action === 'delete') {
          tags = tags.filter(
            (tag) => tag.replace(/\s/g, '') !== item.tag.replace(/\s/g, ''),
          );
          // If the tag has been marked as edited, replace it
        } else if (item.action === 'edit') {
          tags = tags.map((tag) => {
            if (tag.replace(/\s/g, '') === item.oldTag.replace(/\s/g, '')) {
              return item.newTag;
            }
            return tag;
          });
        }
      });

      return [tags.join(',')];
    });

    // Update the rows
    const request = {
      spreadsheetId: SHEET_ID,
      range: 'E2:E',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: newRows,
      },
    };
    const response = await sheets.spreadsheets.values.update(request);

    return response;
  } else {
    return { message: 'No tags to update', status: 200 };
  }
}

async function main(data) {
  const tagsArray = data.filteredTags.map((tag) => tag.tag);

  try {
    // Update the tags in the cell
    const cellRes = await updateTagsInCell(tagsArray);
    // Update the tags in the rows
    const rowsRes = await updateTagsInRows(data.tagsHistory);

    // Backup the spreadsheet without waiting for it to finish
    backupSpreadsheet();

    return { cellRes, rowsRes };
  } catch (err) {
    console.log(err);
    return {
      message: 'Error updating tags',
      status: 500,
    };
  }
}
