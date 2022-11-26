import { sheets, SHEET_ID } from '../../../data/getGoogleApiClient';
import { backupSpreadsheet } from '../../../data/backupSpreadsheet';
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

async function updateSpreadsheetData(content) {
  // Take the content and write it to the K5 cell in the spreadsheet
  const request = {
    spreadsheetId: SHEET_ID,
    range: 'K5',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[content]],
    },
  };
  const res = await sheets.spreadsheets.values.update(request);

  return res;
}

async function main(content) {
  const data = await updateSpreadsheetData(content);
  backupSpreadsheet();

  return data;
}
