import mongoose from "mongoose"

export const ResultSchema = new mongoose.Schema({
    definition: {type: String, required: true},
    partOfSpeech: {type: String, required: true},
    synonym: String, 
})