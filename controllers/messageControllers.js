const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log('Invalid data passed into request');
    return res.status(400).json({ message: 'Invalid data passed into request' });
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    console.log("Created Message:", message); // Debugging line

    if (message && message._id) {
      message = await message.populate('sender', 'name pic');
      message = await message.populate('chat');
    } else {
      return res.status(400).json({ message: 'Message creation failed' });
    }

    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name pic',
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    console.log(error); // Log the full error
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params; // Ensure chatId is retrieved from params

  try {
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name pic email')
      .populate('chat');

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = { sendMessage, allMessages };
  