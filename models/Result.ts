import mongoose from "mongoose"

export const ResultSchema = new mongoose.Schema({
    definition: {type: String, required: true},
    partOfSPeech: {type: String, required: true},
    synonym: String, 
})