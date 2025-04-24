import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .populate('readBy', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { conversation, content } = req.body;
    const message = new Message({
      conversation,
      sender: req.user._id,
      content,
      readBy: [req.user._id]
    });

    await message.save();

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversation, {
      lastMessage: message._id
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('readBy', 'name avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findOneAndDelete({
      _id: messageId,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 