import mongoose, {Schema} from 'mongoose';
import hash from '../util/hash';

const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    status: {type: String, default: 'offline'},
    statusMessage: {type: String, default: ''},
});

// password validation method
UserSchema.methods.validPassword = function(password) {
    return this.password === hash(password);
};

export const User = mongoose.model('User', UserSchema);
