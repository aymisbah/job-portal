import mongoose ,{Schema}from "mongoose";

const jobSchema = new mongoose.Schema({
    company: {type : Schema.Types.ObjectId, ref:"Companies" },
    jobTitle: {type: String, required : [true , "Job Title is required"]},
    jobType: {type: String, required : [true , "Job Type is required"]},
    location: {type: String, required:[true, "location is required"]},
    salary:{type : Number, required: [true, "Salary is required"]},
    experiences:{type : Number, default: 1},
    detail:[{desc :{type : String}, requirements:{type : String}}],
    application : [{type: Schema.Types.ObjectId, ref:"Users"}],
},{timestamps:true}
);

const Jobs = mongoose.model("Jobs", jobSchema);
export default Jobs;