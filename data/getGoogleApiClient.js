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

export const FOLDER_ID = '1kHSatX8MoYiJBit3KHZwrqymOFrwJ0y1';
export const SHEET_ID = '1v9QJRSB2i8S5ZDU0TosGKrnicyqBLBlxS-Oiv_P1aWs';
