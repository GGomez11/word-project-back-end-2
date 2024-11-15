import { Schema } from "mongoose"
import { ResultSchema } from "./Result"

export const WordSchema = new Schema({
   word: {type: String, required: true},
   results: {type: [ResultSchema], required: true},
   pronunciation: {
      written: String,
      audioURL: String,  
   }
})