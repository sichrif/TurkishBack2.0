const router = require("express").Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
let path = require('path');
const Pin = require("../models/Pin");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("./verifyToken");
  
const DIR = './public/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});
//create a pin
router.post("/", upload.array('imgCollection', 6),  async (req, res) => {
  const reqFiles = [];
  const url = req.protocol + '://' + req.get('host')
  for (var i = 0; i < req.files.length; i++) {
      reqFiles.push(url + '/public/' + req.files[i].filename)
  }

  const newPin = new Pin({
   long: req.body.long,
   lat: req.body.lat,
   title: req.body.title,
   desc: req.body.desc,
   rating: req.body.rating,

    imgCollection: reqFiles});
  try {
    const savedPin = await newPin.save();
    res.status(200).json(savedPin);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all pins
router.get("/", async (req, res) => {
  try {
    const pins = await Pin.find();
     res.status(200).json(pins);
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete pin
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Pin.findByIdAndDelete(req.params.id);
    res.status(203).json("Pin has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete amm pin
// router.delete("/del", async (req, res) => {
//   try {
//     await Pin.deleteMany({});
    
//   } catch (err) {
//    }
// });

module.exports = router;
