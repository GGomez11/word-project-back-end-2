import { Schema } from "mongoose"
import {ObjectId} from "mongoose"
import { ResultSchema } from "./Result"

export const WordSchema = new Schema({
   word: {type: String, required: true},
   results: {type: [ResultSchema], required: true},
   pronounciation: String,  
})