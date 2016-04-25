import mongoose, {Schema} from 'mongoose';

const TeamSchema = new Schema({
    name: String,
    users: [Schema.Types.ObjectId],
});

export const Team = mongoose.model('Team', TeamSchema);
