import { drive, SHEET_ID, BACKUP_FOLDER_ID } from './getGoogleApiClient';

export const backupSpreadsheet = async () => {
  const response = await createSpreadsheetCopy();
  return response;
};

const createSpreadsheetCopy = async () => {
  const request = {
    resource: {
      name: `_database_backup_${new Date().toISOString()}`,
      parents: [BACKUP_FOLDER_ID],
    },
    fileId: SHEET_ID,
  };
  const response = await drive.files.copy(request);

  return response;
};
