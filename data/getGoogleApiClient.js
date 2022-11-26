const { google } = require('googleapis');

const scopes = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_EMAIL,
    private_key: process.env.NEXT_PUBLIC_GOOGLE_AUTH_PRIVATE_KEY.replace(
      /\\n/g,
      '\n',
    ),
  },
  scopes,
});

export const drive = google.drive({ version: 'v3', auth });
export const sheets = google.sheets({ version: 'v4', auth });

export const FOLDER_ID = '1YTv0TAqylMwOHT9D7dCg3OvBL_ZsApN9';
export const SHEET_ID = '10DvkrvIcwth2IiZwuVDxW0CmsM0t3qc5XOW9I13VLfA';
export const PARENT_FOLDER_ID = '14qYBoDylfM9MptKTEwpMm-uyXnsvjnO6';
