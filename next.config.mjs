/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit', 'canvas'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  }
}

export default nextConfig