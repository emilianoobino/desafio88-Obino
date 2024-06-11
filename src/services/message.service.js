import MessageModel from "../models/message.model.js";

const messageService = {
    getAllMessages: async () => {
        return await MessageModel.find().lean();
    }
};

export { messageService };

