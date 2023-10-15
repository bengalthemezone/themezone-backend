/* eslint-disable security/detect-non-literal-fs-filename */
/*
const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

const s3 = new aws.S3({
  accessKeyId: "AKIAW2K5AR3JDD4FOP7T",
  secretAccessKey: "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",
  Bucket: "bengal-software",
});

const profileImgUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "bengal-software-ltd",
    acl: "public-read",
    key: function (req, file, cb) {
      var newFileName = Date.now() + "-" + file.originalname;
      cb(null, newFileName);
    },
  }),
});

module.exports = {
  profileImgUpload,
};

*/

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png " || file.mimetype === "video/mp4" || file.mimetype === "application/zip") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1000,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
