import fileReaderStream from 'filereader-stream';

export const prepareFile = async (file) => {
  let preparedFile;
  try {
    await new Promise((resolve, reject) => {
      const stream = fileReaderStream(file);
      stream.on('error', reject);
      stream.on('data', (data) => {
        preparedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          stream: data,
        };
        resolve();
      });
    });
  } catch (err) {
    console.log(err);
    return null;
  }

  return preparedFile;
};
