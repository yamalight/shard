import mongoose, {Schema} from 'mongoose';

const MessageSchema = new Schema({
    message: String,
    user: Schema.Types.ObjectId,
    time: {type: Date, default: Date.now},
});

export const Message = mongoose.model('Message', MessageSchema);
