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

async function updateIndexRows(originIndex, targetIndex) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
  });
  const rows = res.data.values;

  console.log('originIndex', originIndex);
  console.log('targetIndex', targetIndex);

  if (rows && rows.length) {
    // Store the row that is being moved
    const rowToMove = rows.find((row) => {
      return Number(row[7]) === originIndex;
    });
    // If the user is moving the row up
    if (originIndex > targetIndex) {
      // Go through each row and if the index is between the target and origin, add 1 to the index
      rows.forEach((row) => {
        if (Number(row[7]) >= targetIndex && Number(row[7]) < originIndex) {
          row[7] = Number(row[7]) + 1;
        }
      });
      // If the user is moving the row down
    } else if (originIndex < targetIndex) {
      // Go through each row and if the index is between the origin and target, subtract 1 from the index
      rows.forEach((row) => {
        if (Number(row[7]) > originIndex && Number(row[7]) <= targetIndex) {
          row[7] = Number(row[7]) - 1;
        }
      });
    }
    // Update the row with the new index
    rowToMove[7] = targetIndex;

    // Update the spreadsheet
    const updateRequest = {
      spreadsheetId: SHEET_ID,
      range: 'A2:H',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    };
    const updateResponse = await sheets.spreadsheets.values.update(
      updateRequest,
    );

    return updateResponse;
  } else {
    console.log('No data found.');
  }
}

export const sortSpreadsheetByIndex = async (rows) => {
  // Take the rows and sort them by index
  // Then return the sorted rows, that coud be used to update the spreadsheet
  const sortedRows = rows.sort((a, b) => {
    return a[7] - b[7];
  });

  return sortedRows;
};

async function main(data) {
  const { originIndex, targetIndex } = data;
  const response = await updateIndexRows(
    Number(originIndex),
    Number(targetIndex),
  );

  return response;
}
