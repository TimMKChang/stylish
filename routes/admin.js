const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs');

// aws S3
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_SECRET_ACCESS,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

// redis
const { client } = require('../redis/config.js');

let image_url = process.env.AWS_CLOUDFRONT_DOMAIN;

const { Product, Color, ProductColor, Variant, Campaign, OtherImage } = require('../models');
// res message
let message;

// multer
// handle image name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images_temp');
  },
  filename: async function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      return cb(null, true);
    }
    req.fileValidationError = 'only accept image';
    cb(null, false);
  },
});

// check authentication
router.use(require('../middleware/authenticate'));

router.post('/product', upload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'other_images', maxCount: 3 }]), async (req, res) => {

  const { id, title, description, price, texture, wash, place, note, sizes, story, colorCodes, colorNames, stocks, category } = req.body;
  const main_image = req.files['main_image'];
  const other_images = req.files['other_images'];

  // for delete image
  function deleteImage() {
    // delete image
    // main_image
    fs.unlinkSync('./images_temp/' + main_image[0].filename);
    // other_images
    for (const other_image of other_images) {
      fs.unlinkSync('./images_temp/' + other_image.filename);
    }
  }

  // avoid id be 0 
  if (id <= 0) {
    deleteImage();

    message = 'Product id should be positive integer.';
    return res.send({ message });
  }

  // avoid empty
  if (!id || !title || !description || !price || !texture || !wash || !place || !note || !sizes || !story || !colorCodes || !colorNames || !stocks || !category || !main_image || !other_images) {
    deleteImage();

    message = 'All fields are required.';
    return res.send({ message });
  }

  // avoid duplicate
  // also handle image
  const product_check = await Product.findByPk(id);
  if (product_check) {
    deleteImage();

    message = `id: ${id} product already exist`;
    return res.send({ message });

  }

  // // main image 
  const image_filename = main_image[0].originalname.split('-')[1];
  const main_image_url = `${image_url}/assets/${id}/${image_filename}`;

  Product.create({ id, title, description, price, texture, wash, place, note, sizes, story, category, main_image: main_image_url })
    .then(async () => {

      // after create product
      // color
      const colorCodeArray = colorCodes.split(',');
      // const colorNameArray = colorNames.split(',');
      for (const code of colorCodeArray) {
        await Color.findOne({
          where: { code },
        }).then(color => {
          ProductColor.create({ product_id: id, color_id: color.id });
        });
      }

      // stock
      const sizeArray = sizes.split(',');
      const stocksArray = stocks.split(';').map(stock => {
        const stocks = stock.replace(/[\[\]]/g, '').split(',');
        return stocks;
      });

      for (const [color_index, stocks] of stocksArray.entries()) {

        for (const [size_index, stock] of stocks.entries()) {
          await Variant.create({
            color_code: colorCodeArray[color_index],
            size: sizeArray[size_index],
            stock: +stock,
            product_id: id
          });
        }

      }

      // other_images
      // OtherImage
      for (const image of other_images) {
        const image_filename = image.originalname.split('-')[1];
        await OtherImage.create({
          image: `${image_url}/assets/${id}/${image_filename}`,
          product_id: id
        });
      }

    })
    .then(async () => {
      // upload to AWS S3
      const tempPath = `./images_temp/${main_image[0].filename}`;
      const [product_id, filename] = main_image[0].filename.split('-');
      const uploadPath = `assets/${product_id}`;
      await uploadFile(tempPath, uploadPath, filename);

      for (const other_image of other_images) {
        const tempPath = `./images_temp/${other_image.filename}`;
        const [product_id, filename] = other_image.filename.split('-');
        const uploadPath = `assets/${product_id}`;
        await uploadFile(tempPath, uploadPath, filename);
      }

      // delete temp 
      deleteImage();

      message = `id: ${id} product saved`;
      return res.send({ message });
    })
    .catch(err => {
      deleteImage();
      return res.send({ message: err.message });
    });

});


router.post('/campaign', upload.fields([{ name: 'picture', maxCount: 1 }]), async (req, res) => {

  const { campaign_id, product_id, story } = req.body;
  const picture = req.files['picture'];
  const picture_filename = picture[0].originalname;

  function deleteImage() {
    fs.unlinkSync('./images_temp/' + picture_filename);
  }

  // validation
  // avoid id be 0 
  if (campaign_id <= 0) {
    deleteImage();
    message = 'Product id should be positive integer.';
    return res.send({ message });
  }

  // avoid empty
  if (!campaign_id || !product_id || !story || !picture) {
    deleteImage();
    message = 'All fields are required.';
    return res.send({ message });
  }

  // check product_id
  const product_check = await Product.findByPk(product_id);
  if (!product_check) {
    deleteImage();
    message = `id: ${product_id} product does not exist`;
    return res.send({ message });
  }

  const picture_url = `${image_url}/campaigns/${picture_filename.split('-')[1]}`;

  // create
  Campaign.create({ id: campaign_id, picture: picture_url, product_id, story })
    .then(async (campaign) => {
      if (campaign) {
        // upload to AWS S3
        const tempPath = `./images_temp/${picture_filename}`;
        const uploadPath = 'campaigns';
        const filename = picture_filename.split('-')[1];
        await uploadFile(tempPath, uploadPath, filename);
        // delete temp 
        deleteImage();

        message = `id: ${campaign_id} campaign saved`;

        // delete redis key when creating campaign
        if (client.ready) {
          await client.delAsync('campaigns');
        }

        return res.send({ message });
      }
    })
    .catch(() => {
      deleteImage();
      message = `id: ${campaign_id} campaign already exist`;
      return res.send({ message });
    });

});

module.exports = router;

function uploadFile(filePath, uploadPath, filename) {

  return new Promise((resolve, reject) => {
    // Read content from the file
    const fileContent = fs.readFileSync(filePath);
    const extension = filename.split('.')[1];
    // Setting up S3 upload parameters
    const params = {
      Bucket: 'haboy-stylish',
      Key: `${uploadPath}/${filename}`, // File name you want to save as in S3
      Body: fileContent,
      ACL: 'public-read',
      ContentType: `image/${extension}`,
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      }
      // console.log(`File uploaded successfully. ${data.Location}`);
      resolve();
    });
  });

};
