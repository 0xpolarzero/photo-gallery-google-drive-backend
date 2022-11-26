import {
  drive,
  sheets,
  FOLDER_ID,
  SHEET_ID,
} from '../../../data/getGoogleApiClient';
import { backupSpreadsheet } from '../../../data/backupSpreadsheet';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(function handler(req, res) {
  return new Promise((resolve, reject) => {
    try {
      // If the request has a body, it needs to update a row based on the data
      if (req.body) {
        main(req.body).then((data) => {
          res.status(200).json(data);
          resolve();
        });
        // Otherwise it's upating the spreadsheet from the folder
      } else {
        main().then((data) => {
          res.status(200).json(data);
          resolve();
        });
      }
    } catch (err) {
      res.status(500).json(err);
      reject(err);
    }
  });
});

async function updateSpreadsheetFromFolder(photos) {
  // Check rows A to G, starting from row 2
  // For all photos, if the id from this photo is not in the spreadsheet, add it
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
  });
  // If there is no data in the spreadsheet, add all photos
  if (!res.data.values) {
    const rows = photos.map((photo) => {
      return [
        photo.id,
        photo.src,
        photo.name,
        '',
        '',
        photo.width,
        photo.height,
        photos.indexOf(photo),
      ];
    });
    const request = {
      spreadsheetId: SHEET_ID,
      range: 'A2:H',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    };
    const response = await sheets.spreadsheets.values.update(request);
    return response;
  }
  // If there is data in the spreadsheet...
  const rows = res.data.values;

  if (rows && rows.length) {
    const ids = rows.map((row) => {
      return row[0];
    });
    //  ... check if the photo is already in the spreadsheet
    const newPhotos = photos.filter((photo) => {
      return !ids.includes(photo.id);
    });
    if (newPhotos.length > 0) {
      // If there are new photos, add them to the spreadsheet
      // Find the number of rows, exluding deleted ones (index -1)
      let imgCount = rows.filter((row) => {
        return row[7] !== '-1';
      }).length;
      const newRows = newPhotos.map((photo) => {
        return [
          photo.id,
          photo.src,
          photo.name,
          '',
          '',
          photo.width,
          photo.height,
          imgCount++,
        ];
      });
      const request = {
        spreadsheetId: SHEET_ID,
        range: 'A2:H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: newRows,
        },
      };
      const response = await sheets.spreadsheets.values.append(request);

      return response;
    } else {
      console.log('No new photos found.');
      return 'NO_NEW_PHOTOS';
    }
  } else {
    console.log('No data found.');
    return 'NO_DATA_FOUND';
  }
}

async function updateSpreadsheetRow(id, src, title, description, tags, index) {
  // Find the row with the id
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'A2:H',
  });
  const rows = res.data.values;
  const row = rows.find((row) => {
    return row[0] === id;
  });
  // Update the row with the new data
  const newRow = [[id, src, title, description, tags, row[5], row[6], index]];
  const request = {
    spreadsheetId: SHEET_ID,
    range: `A${rows.indexOf(row) + 2}:H${rows.indexOf(row) + 2}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: newRow,
    },
  };

  const response = await sheets.spreadsheets.values.update(request);

  // Now update the tags in cell K2 with the new tags, to keep the tags list up to date
  // Check the tags in cell K2
  // And add the new tags to the list after removing duplicates
  const tagsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'K2',
  });
  const tagsRows = tagsRes.data.values;
  let tagsArray;

  if (tagsRows && tagsRows.length) {
    const tagsRow = tagsRows[0];
    tagsArray = tagsRow[0]?.split(',');
  } else {
    tagsArray = [];
  }

  // Remove any extra space
  const newTags = tags.split(',').map((tag) => {
    return tag.trim();
  });
  // Concat both arrays and remove duplicates
  const newTagsArray = [...new Set([...tagsArray, ...newTags])];
  // Prepare it to be added to the spreadsheet
  const newTagsRow = [newTagsArray.join(',')];
  const tagsRequest = {
    spreadsheetId: SHEET_ID,
    range: 'K2',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [newTagsRow],
    },
  };
  const tagsResponse = await sheets.spreadsheets.values.update(tagsRequest);

  return { response, tagsResponse };
}

async function getGoogleDrivePhotos() {
  const res = await drive.files
    .list({
      // q: "trashed=false and mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/gif' or mimeType='image/webp' or mimeType='image/bmp' or mimeType='image/tiff' or mimeType='image/jpg'",
      q: `'${FOLDER_ID}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, imageMediaMetadata, webContentLink)',
      pageSize: 1000,
    })
    .catch((err) => {
      console.log(err);
    });
  const files = res.data.files;
  console.log(files);

  if (files && files.length) {
    return files.map((file) => {
      return {
        id: file.id,
        src: file.webContentLink,
        name: file.name,
        width: file.imageMediaMetadata.width,
        height: file.imageMediaMetadata.height,
      };
    });
  } else {
    console.log('No files found.');
    return [];
  }
}

async function main(parameters) {
  const photos = await getGoogleDrivePhotos();

  if (!parameters) {
    return await updateSpreadsheetFromFolder(photos);
  }

  const { id, src, title, description, tags, index } = parameters;
  const response = await updateSpreadsheetRow(
    id,
    src,
    title,
    description,
    tags,
    index,
  );
  // Backup without waiting for it to finish
  backupSpreadsheet();

  return response;
}
