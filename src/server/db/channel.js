import mongoose, {Schema} from 'mongoose';

const ChannelSchema = new Schema({
    name: String,
    description: String,
    team: Schema.Types.ObjectId,
    users: [{
        id: Schema.Types.ObjectId,
        access: {type: String, enum: ['owner', 'admin', 'member']},
    }],
});

export const Channel = mongoose.model('Channel', ChannelSchema);
