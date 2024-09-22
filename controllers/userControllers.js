const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please Enter all the fields' });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      pic
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Failed to create user' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//search user
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    })
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
})


const allUsers = asyncHandler(async(req,res)=>{
  const keyword = req.query.search?{
    $or:[
      {name:{$regex:req.query.search,$options:'i'}},
      {email:{$regex:req.query.search,$options:'i'}}
    ]
  }:{}
  const users = (await User.find(keyword))
  res.send(users)
})
module.exports = { registerUser, authUser , allUsers };
