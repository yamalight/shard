import mongoose, {Schema} from 'mongoose';

const TeamSchema = new Schema({
    name: String,
    users: [{
        id: Schema.Types.ObjectId,
        access: {type: String, enum: ['owner', 'admin', 'member']},
    }],
});

export const Team = mongoose.model('Team', TeamSchema);
