import mongoose from "mongoose"
import { WordSchema } from "./WordSchema"

const UserSchema = new mongoose.Schema({
    uid: String, 
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true}, 
    password: String,
    vocabulary: [WordSchema],
    authProviders: [String],
})

export default module.exports = mongoose.model('User', UserSchema)