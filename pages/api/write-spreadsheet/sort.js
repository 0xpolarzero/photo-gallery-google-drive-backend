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

async function sortSpreadsheetById(idArray) {
  // Find the row with the id
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
  });
  const rows = res.data.values;

  if (rows && rows.length) {
    // Sort the rows using the idArray
    const newRows = [];
    idArray.forEach((item) => {
      const row = rows.find((row) => {
        return row[0] === item.id;
      });
      newRows.push(row);
    });

    // Update each index (row[6]) with the new index
    newRows.forEach((row, index) => {
      row[7] = index;
    });

    // Find the number of rows with an index of -1 to start writing after
    const deletedRows = rows.filter((row) => row[6] === '-1');
    const startIndex = deletedRows.length + 2;

    // Update the spreadsheet
    const sortRequest = {
      spreadsheetId: SHEET_ID,
      range: `A${startIndex}:H`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: newRows,
      },
    };
    const sortResponse = await sheets.spreadsheets.values.update(sortRequest);

    return sortResponse;
  }
}

async function main(data) {
  const response = await sortSpreadsheetById(data);
  return response;
}
