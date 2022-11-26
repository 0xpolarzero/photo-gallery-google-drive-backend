import { sheets, SHEET_ID } from '../../../data/getGoogleApiClient';
import { sortSpreadsheetByIndex } from '../write-spreadsheet/update-index';
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

async function deleteOrRestoreSpreadsheetRow(id, type) {
  // Find the row with the id
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
  });
  const rows = res.data.values;
  const row = rows.find((row) => {
    return row[0] === id;
  });

  const index = Number(row[6]);
  // If type is delete, change the index of the row to -1
  if (type === 'delete') {
    row[6] = -1;
    // Then take all rows with index > the original index and subtract 1 from the index
    rows.forEach((row) => {
      if (Number(row[6]) > index) {
        row[6] = Number(row[6]) - 1;
      }
    });
  } else if (type === 'restore') {
    // If type is restore, change the index of the row to highest index + 1
    // Find the highest index
    let newIndex = 0;
    // If there are no rows with index > -1, set the index to 0
    rows.forEach((row) => {
      if (Number(row[6]) >= newIndex) {
        newIndex = Number(row[6]) + 1;
      }
    });
    row[6] = newIndex;
  }

  // Update the spreadsheet
  const updateRequest = {
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: rows,
    },
  };
  const updateResponse = await sheets.spreadsheets.values.update(updateRequest);

  // Sort the spreadsheet by index
  const sortedRows = await sortSpreadsheetByIndex(rows);
  const sortRequest = {
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: sortedRows,
    },
  };
  const sortResponse = await sheets.spreadsheets.values.update(sortRequest);

  return { updateResponse, sortResponse };
}

async function main(parameters) {
  const { id, type } = parameters;
  const data = await deleteOrRestoreSpreadsheetRow(id, type);

  return data;
}
