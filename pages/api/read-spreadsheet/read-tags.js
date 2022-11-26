import { sheets, SHEET_ID } from '../../../data/getGoogleApiClient';

export default function handler(req, res) {
  return new Promise((resolve, reject) => {
    main()
      .then((data) => {
        res.status(200).json(data);
        resolve();
      })
      .catch((err) => {
        res.status(500).json(err);
        reject(err);
      });
  });
}

async function getSpreadsheetData() {
  // Read tags from the K2 cell in the spreadsheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'K2',
  });
  const rows = res.data.values;
  if (rows && rows.length) {
    return rows.map((row) => {
      return {
        tags: row[0].split(','),
      };
    });
  } else {
    console.log('No data found.');
    return null;
  }
}

async function main() {
  const data = await getSpreadsheetData();
  return data;
}
