const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const MulterSharpResizer = require("multer-sharp-resizer");
AWS.config.loadFromPath(__dirname + '/s3config.json');


const s3 = new AWS.S3()

const sizes = [
    {
      path: "original",
      width: null,
      height: null,
    },
    {
      path: "large",
      width: 800,
      height: 800,
    },
    {
      path: "medium",
      width: 300,
      height: 300,
    },
    {
      path: "thumbnail",
      width: 100,
      height: 100,
    },
];

const uploadPath = `./public/uploads/${year}/${month}`;
 
const fileUrl = `${req.protocol}://${req.get(
    "host"
)}/uploads/${year}/${month}`;

// // sharp options
// const sharpOptions = {
//     fit: "contain",
//     background: { r: 255, g: 255, b: 255 },
// };

// create a new instance of MulterSharpResizer and pass params
const resizeObj = new MulterSharpResizer(
    req,
    filename,
    sizes,
    uploadPath,
    fileUrl,
    sharpOptions
);

// call resize method for resizing files
await resizeObj.resize();

// get details of uploaded files
const images = resizeObj.getData();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'sparta-real-bucket',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read-write',
        key: function (req, file, cb) {
            cb(null, `${Date.now()}_${file.originalname}`);
        },
    }),
});

module.exports = upload;
