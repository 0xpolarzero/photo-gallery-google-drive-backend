/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    loader: 'akamai',
    path: '',
  },
};

module.exports = nextConfig;
