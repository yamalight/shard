import mongoose, {Schema} from 'mongoose';

const TeamSchema = new Schema({
    name: String,
    users: [{
        id: {type: Schema.Types.ObjectId, ref: 'User'},
        access: {type: String, enum: ['owner', 'admin', 'member']},
    }],
});

export const Team = mongoose.model('Team', TeamSchema);
