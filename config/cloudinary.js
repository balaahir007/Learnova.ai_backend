import cloudinary from 'cloudinary'
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtliktnul',
  api_key: process.env.CLOUDINARY_API_KEY || '826828692537428',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'SGr8reUCxDEXkjcpUkMetMckWmI',
  secure: true,
});

export default cloudinary