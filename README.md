# Personal photo gallery - Google Drive as a backend

This is a simple images gallery that uses Google Drive as a backend, to:

- fetch images from a folder ;
- write, retrieve and update related informations (title, description, tags, etc.) in a spreadsheet, which behaves as a database - using an admin interface.

It feels like a great way to implement an image gallery, using your own Google Drive account for storage and only the website to customize the display. It completely eliminates the need for a database, and the need to host the images on a server, therefore reducing costs and complexity.

## Features

Broadly:

- Use images from your Google Drive account ;
- Use a spreadsheet as a database ;
- Update the database using an admin interface ;
- Automatic backups of the spreadsheet (when writing to the database) ;
- Use Auth0 to handle authentication ;
- Prevent unauthorized access to the admin interface and the API routes.

Managing the gallery:

- Display images in a responsive grid, and show a modal when clicking on an image ;
- Display the image title, description and tags, and update them in the dashboard ;
- Quickly hide/show images in the gallery, and move them in the display order ;
- Bulk update tags ;
- Display an 'About' page, and update its content in the dashboard.

## Known limitations

To display images, we are using the `webContentLink` property of the Google Drive API.

When dealing with large amounts of requests, such as displaying many images in a short period of time, the user IP address might be blocked by Google from accessing the images, for a few minutes.

To give you an idea, if there are 100 photos in the spreadsheet, a few successive refreshs would probably be enough to trigger the security, thus preventing the photos from being displayed.

While this is a nice experiment, and a good solution for interacting with a personnal Google Drive, storing and retrieving data without the need of an additional provider, <b>this is not a viable solution for a production-ready gallery</b>. If there is no need to make regular requests to google to display the photos, and you can stick to the API, it might be enough for your use case.

If you would like to handle image deletion in the folder, you shoud implement your own logic (i.e. when updating the spreadsheet, add an empty row for the non-exising image that has an id in the spreadsheet, and push it at the end).

## Getting Started

### Prerequisites

You will need to setup a Google Drive account, the API, and a spreadsheet to store the data.

For the API part, [this guide is an amazing starting point](https://bretcameron.medium.com/how-to-use-the-google-drive-api-with-javascript-57a6cc9e5262). It will help you:

- create a Google Cloud project ;
- enable the Google Drive & Sheets API ;
- create a service account, and import the credentials in the project ;
- share files with the service account ;
- import the Google API client library.

Once you are in this repository, you will need to populate the `.env.local` file, following the `.env.local.example` file. The Google-related variables are extracted from the `credentials.json` file, and the rest from the Auth0 setup (to limit access to the admin interface).

You can follow this folder structure:

```
├── Photos (for the images)
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── ...
├── backups (automatic backups of the spreadsheet)
├── database (spreadsheet)
```

Knowing that the whole folder needs to be shared with the service account, and the one containing the photos needs to be shared with the `Anyone with the link` option.

Finally, you can update the `FOLDER_ID`, `SHEET_ID` and `BACKUP_FOLDER_ID` variables in the `data/getGoogleApiClient.js` file.

### Installing

To install the dependencies, run:

```bash
npm install
# or
yarn
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Built With

- [Next.js](https://nextjs.org/) - The React framework
- [Auth0](https://auth0.com/) - Authentication and authorization platform
- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk) - Google Drive API
- [Google Sheets API](https://developers.google.com/sheets/api) - Google Sheets API
- [react-photo-album](https://react-photo-album.com/) - React photo album
- [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) - Yet another React lightbox

## License

This project is licensed under the MIT License. Use it and modify it as you wish, and let me know if you have any feedback!
