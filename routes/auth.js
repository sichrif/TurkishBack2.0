const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const stripe = require('stripe')('sk_test_51JRjPOG9fFF0nTkRRANWMcUnLi1dcY1ZyxwNCXzr6UsU2Emp1PkngU1m5IL9YyTE6NiQBowrp2CGkeeeW6RaE6F400fPNDEtT4');
const stripemethods = require('./stripemethods')
//REGISTER
router.post("/register", async (req, res) => {
  ///////////////////
  const {email} = req.body; 
 
  try {
    const customer = await stripe.customers.create({
      email: email,
    });
  const newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: email,
    subsId:customer.id,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

    try {
      const savedUser = await newUser.save();
      res.status(201).json({'savedUser':savedUser});
    } catch (err) {
      res.status(500).json(err);
    }  
   } catch (error) {
   res.status(500).json(error)
  }
/////////////////////  

}); 
//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong credentials!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      {expiresIn:"3d"}
    );

    const { password, ...others } = user._doc;

    res.status(200).json({...others, accessToken});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
