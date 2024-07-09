const DB_NAME = 'sharelearner';
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.MONGO_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const DEFAULT_AVATAR = 'https://res.cloudinary.com/dqufodszt/image/upload/v1715755091/sharelerner/illustration-businessman_53876-5856_1_-min_qkfjho.jpg';
const DEFAULT_COVER_PHOTO= 'https://res.cloudinary.com/dqufodszt/image/upload/v1719900787/CM-hero-bg_2x_rtcdou.jpg';
const DEFAULT_GROUP_ICON = 'https://res.cloudinary.com/dqufodszt/image/upload/v1719901224/image_qg6trs.png'; 
const DEFAULT_GROUP_BANNER='https://res.cloudinary.com/dqufodszt/image/upload/v1719900521/download_fqyypb.jpg';
const SHARELEARNER_LOGO = 'https://res.cloudinary.com/dqufodszt/image/upload/v1716363215/sharelerner/Main_1_u89enm.png'


export { 
    DB_NAME, 
    PORT, 
    DB_URL, 
    CLOUDINARY_CLOUD_NAME, 
    CLOUDINARY_API_KEY, 
    CLOUDINARY_API_SECRET,
    DEFAULT_AVATAR,
    DEFAULT_COVER_PHOTO,
    DEFAULT_GROUP_ICON,
    DEFAULT_GROUP_BANNER,
    SHARELEARNER_LOGO,
};
