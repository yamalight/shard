import mongoose, {Schema} from 'mongoose';

const ChannelSchema = new Schema({
    name: String,
    description: String,
    team: {type: Schema.Types.ObjectId, ref: 'Team'},
    users: [{
        id: {type: Schema.Types.ObjectId, ref: 'User'},
        access: {type: String, enum: ['owner', 'admin', 'member']},
    }],
});

export const Channel = mongoose.model('Channel', ChannelSchema);
