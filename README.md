This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

Photos Google Drive:

- needs to be jpg, jpeg, png, bmp, gif, or webp

- fetch from the google sheets to display
  - use the index to display in the right order
- getch from the google sheets for admin

  - show table with data, use thumbnail to show image
  - let move up and down to change the index
  - click save for each row

- Change index
  - move up and down: take row with index -1 or +1 and swap index
  - input index: loop all rows and +1 to all rows with index >= input index

// !
Move photos virtual

- make sure it's exactly the same display as the gallery
- save & back to dashboard buttons

- Why updates as if deleted items were not deleted ?
- Why uploads are 0 bytes
  Upload photos
  Connexion admin

- Spreadsheet is copied after an edit to the spreadsheet
  - edit title, description, tags
  - edit tags
