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
  // Get columns A to D, all rows with data
  // Column 0: id, 1: title, 2: description, 3: tags, 4: width, 5: height, 6: index
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
  });
  const rows = res.data.values;
  if (rows && rows.length) {
    return rows.map((row) => {
      return {
        id: row[0],
        src: row[1],
        title: row[2],
        description: row[3],
        tags: row[4].split(','),
        width: row[5],
        height: row[6],
        index: row[7],
        key: row[0],
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
