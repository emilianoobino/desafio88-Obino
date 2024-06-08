const MessageModel = require("../models/message.model");

exports.getAllMessages = async () => {
    return await MessageModel.find().lean();
};