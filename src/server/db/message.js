import mongoose, {Schema} from 'mongoose';

const MessageSchema = new Schema({
    message: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    channel: {type: Schema.Types.ObjectId, ref: 'Channel'},
    time: {type: Date, default: Date.now},
});

export const Message = mongoose.model('Message', MessageSchema);
