import { drive } from '../../data/getGoogleApiClient';
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

async function uploadFileToDrive(file) {
  const fileObject = {
    name: file.name,
    mimeType: file.type,
    parents: ['1kHSatX8MoYiJBit3KHZwrqymOFrwJ0y1'],
  };

  const media = {
    mimeType: file.type,
    body: JSON.stringify(file.stream.data),
  };

  const res = await drive.files.create({
    requestBody: fileObject,
    media: media,
  });

  return res.data;
}

async function main(file) {
  const fileObject = JSON.parse(file);
  const uploadedPhotos = await uploadFileToDrive(fileObject);

  return uploadedPhotos;
}
