import { firebaseStorage } from './getFirebaseStorage';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { useState } from 'react';

export const uploadToFirebase = async (files) => {
  let uploadedFiles = [];
  const totalCount = files.length;
  let count = 0;

  await new Promise((resolve, reject) => {
    files.forEach(async (file) => {
      let imageMetadata = {
        name: file.name,
        contentType: file.type,
      };
      // Get that image's width and height
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = async () => {
            imageMetadata.width = img.width;
            imageMetadata.height = img.height;
            resolve();
          };
        };
        reader.onerror = (error) => reject(error);
      });

      let uploadProgress = 0;
      const fileToast = toast.loading(
        `Uploading ${file.name}... ${uploadProgress}%`,
      );
      // Upload the image to firebase storage
      const storageRef = ref(firebaseStorage, file.name);
      // Upload with custom metadata
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: imageMetadata,
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          uploadProgress = Math.round(progress);

          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          console.log(error);
          reject(error);
        },
        async () => {
          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          uploadedFiles.push({ ...imageMetadata, url: downloadURL });
          count++;

          toast.update(fileToast, {
            render: `${file.name} uploaded`,
            type: 'success',
            isLoading: false,
            autoClose: 2000,
          });

          if (count === totalCount) {
            resolve();
          }
        },
      );
    }),
      (error) => {
        console.log(error);
        reject(error);
      };
  }).catch((error) => {
    console.log(error);
  });

  return uploadedFiles;
};
