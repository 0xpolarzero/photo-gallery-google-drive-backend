/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh4.googleusercontent.com',
      'lh3.googleusercontent.com',
      'lh6.googleusercontent.com',
    ],
    loader: 'akamai',
    path: '',
  },
};

module.exports = nextConfig;
