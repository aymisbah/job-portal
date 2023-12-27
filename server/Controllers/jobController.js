import mongoose from "mongoose";
import Jobs from "../models/jobsModel.js";
import Companies from "../models/companiesModel.js";
export const createJob = async (req, res, next) => {
    try {
      const {
        jobTitle,
        jobType,
        location,
        salary,
        vacancies,
        experience,
        desc,
        requirements,
      } = req.body;
  
      if (
        !jobTitle ||
        !jobType ||
        !location ||
        !salary ||
        !requirements ||
        !desc
      ) {
        next("Please Provide All Required Fields");
        return;
      }
  
      const id = req.body.user.userId;
  
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(404).send(`No Company with id: ${id}`);
  
      const jobPost = {
        jobTitle,
        jobType,
        location,
        salary,
        vacancies,
        experience,
        detail: { desc, requirements },
        company: id,
      };
  
      const job = new Jobs(jobPost);
      await job.save();
  
 
      const company = await Companies.findById(id);
  
      company.jobPosts.push(job._id);
      const updateCompany = await Companies.findByIdAndUpdate(id, company, {
        new: true,
      });
  
      res.status(200).json({
        success: true,
        message: "Job Posted Successfully",
        job,
      });
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: error.message });
    }
  };

export const updateJob = async(req, res ,next) =>{
    try {
        const {
            jobTitle,
            jobType,
            location,
            salary,
            vacancies,
            experience,
            desc,
            requirements,
            tags,
          } = req.body;
        const { jobId} = req.params;
        if (
            !jobTitle ||
            !jobType ||
            !location ||
            !salary ||
            !requirements ||
            !desc
          ) {
            next("Please Provide All Required Fields");
            return;
          }
        const id = req.body.user.userId;
        if (!mongoose.Types.ObjectId.isValid(id))
          return res.status(404).send(`No Company with id: ${id}`);
    
        const jobPost = {
          jobTitle,
          jobType,
          location,
          salary,
          vacancies,
          experience,
          detail: { desc, requirements },
          id: jobId,
        };
            await Jobs.findByIdAndUpdate(jobId, jobPost,{new :true});
            res.status(200).json({
                success: true,
                message: "Job post Updated Successfully",
                jobPost,
            });
        
    } catch (error) {
        console.log(error);
        res.status(404).json({message : error.message});
    }
};

export const getJobPosts = async(req, res ,next) =>{
    try{
        const{ search , sort ,location,jtype, exp} = req.query;
        const types = jtype?.split(",");
        const experience =exp?.split("-");

            let queryObject = {};
            if(location){
                queryObject.location = { $regex : location, $options: "i"};
            }
            if(jtype){
                queryObject.jobType = { $in : types};
            }
            if(exp){
                queryObject.experience ={
                    $gte : experience[0],
                    $lte : experience[1],   
                };
            }
            if(search){
                const searchQuery = {
                    $or:[
                        {jobTitle:{ $regex :search, $options: "i"}},
                        {jobTitle:{ $regex :search, $options: "i"}},
  
                    ],
                };
                queryObject = { ...queryObject, ...searchQuery};
            }
            let queryResult = Jobs.find(queryObject).populate({
                path: "company",
                select: "-password",
            });
            if(sort == "Newest"){
                queryResult= queryResult.sort("-createdAt");
            }
            if(sort == "Oldest"){
                queryResult= queryResult.sort("-createdAt");
            }
            if(sort == "A-Z"){
                queryResult= queryResult.sort("jobTitle");
            }
            if(sort == "Z-A"){
                queryResult= queryResult.sort("-jobTitle");
            }

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.page) || 20;
            const skip = (page - 1) * limit;

            const totalJobs = await Jobs.countDocuments(queryResult);
            const numOfPage = Math.ceil(totalJobs / limit);

            queryResult = queryResult.limit(limit * page);
            const jobs = await queryResult;
            res.status(200).json({
                success: true,
                totalJobs,
                data: jobs,
                page,
                numOfPage,
            });
    }catch(error){
        console.log(error);
        res.status(404).json({message: error.message});
    };
};
export const getJobById = async(req, res ,next) =>{
    try {
        const {id} = req.params;
        const job = await Jobs.findById({_id: id}).populate({
            path: "company",
            select: "-password",
        });
        if(!job){
            return res.status(200).send({
                message: "Job Post Not Found",
                success: false,
            });
        }
        const searchQuery = {
            $or: [
              { jobTitle: { $regex: job?.jobTitle, $options: "i" } },
              { jobType: { $regex: job?.jobType, $options: "i" } },
            ],
          };
        let queryResult = Jobs.find(searchQuery).populate({
            path:"company",
            select: "-password",
        })
        .sort({_id: -1});
        queryResult = queryResult.limit(6);
        const similarJobs= await queryResult;
        res.status(200).json({
            success: true,
            data: job,
            similarJobs,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
};

export const deleteJobPost = async(req, res ,next) =>{
    try {
        const {id} = req.params;
        await Jobs.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Job Post Deleted Successefully",
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message});
    }
};