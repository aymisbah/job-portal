import mongoose from "mongoose";
import Companies from "../models/companiesModel.js";
import { response } from "express";


export const register = async(req,res,next ) =>{
    const {name, email , password} = req.body;
    if(!name){
        next("First Name is required");
        return;
    }
    if(!email){
        next("Email is required");
        return;
    }
    if(!password){
        next("password is required must have at least 6 characters");
        return;
    }
    try {
        const accountExist =  await Companies.findOne({email});

        if(accountExist){
            next("Email already exists .Please login");
            return;
        }

        const company = await Companies.create({
            name,
            email,
            password,
        });
        //token
        const token = company.createJWT();
        res.status(201).json({
            success: true,
            message: 'Company account created',
            user : {
                _id: company._id,
                name: company.name,
                email: company.email,
            },
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({message: error.message})
    }
};

export const signIn = async(req,res,next ) =>{
    const{ email, password} = req.body;

    try {
        if(!email || !password){
            next("Please Provide A User Credentials");
            return;
        }

        const company = await Companies.findOne({email}).select("+password");

        if(!company){
            next("Invalid email or Password");
            return;
        }

        const isMatch = await company.comparePassword(password);
        if(!isMatch){
            next("Invalid email or Password");
            return;
        }
        company.password = undefined;

        const token = company.createJWT();
        res.status(200).json({
            success: true,
            message:"Login Successfully",
            user: company,
            token,
        });

    } catch (error) {
        console.log(error);
        res.status(404).json({message : error.message}); 
    }
};

export const updateCompanyProfile = async(req,res,next ) =>{
    const {name , contact ,location ,profileUrl ,about} = req.body;

    try {
        if(!name || !contact || !location || !profileUrl ||!about){
            next("please Provide All Required Fields");
            return;
        }
        const id = req.body.user.userId;
        if(!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).send(`No Company with id: ${id}`);

        const updateCompany = {
            name,
            contact,
            location,
            profileUrl,
            about,
            _id: id,
        };
        const company = await Companies.findByIdAndUpdate( id, updateCompany,{
            new : true,
        });
        const token = company.createJWT();
        company.password = undefined;
        res.status(200).json({
            succes: true,
            message: "company profile Updated Successfully",
            company,
            token,
        });

    } catch (error) {
        console.log(error);
        res.staus(404).json({ message : error.message});
    }
};

export const getCompanyProfile = async(req,res,next ) =>{
    try {
        const id = req.body.user.userId;

        const company = await Companies.findById({ _id: id});
        
        if(!company){
            return res.status(200).send({
                message: "Company Not Found",
                success: false,
            })
        }
        company.password = undefined;
        res.status(200).send({
            success : true,
            data : company,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message : error.message});
    }
};


export const getCompanies = async(req,res,next ) =>{
    try {
        const{ search , sort, location} = req.query;

        //feltring conditions
        const queryObject = {};
        if (search){
            queryObject.name = {$regex : search, $options : "i"}
        }
        if (location){
            queryObject.name = {$regex : location, $options : "i"}
        }
        let queryResult = Companies.find(queryObject).select("-password");
        //Sort
        if(sort === "Newest"){
            queryResult = queryResult.sort("-createdAt");
        }
        if(sort === "Oldest"){
            queryResult = queryResult.sort("createdAt");
        }
        if(sort === "A-Z"){
            queryResult = queryResult.sort("name");
        }
        if(sort === "Z-A"){
            queryResult = queryResult.sort("-name");
        }

        //Padination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.body.limit) || 20;
        const skip = (page -1) *limit;
        // count
        const total = await Companies.countDocuments(queryResult);
        const numOfPage = Math.ceil(total /limit);
        //queryResult = queryResult.skip(skip).limit(limit); 
        queryResult = queryResult.limit(limit*page); 

        const companies = await queryResult;

        res.status(200).json({
            sucess: true,
            total,
            data:companies,
            page,
            numOfPage,
        });

    } catch (error) {
        console.log(error);
        res.staus(404).json({ message : error.message}); 
    }
};


export const getCompanyJobListing = async(req,res,next ) =>{
    const {search , sort} = req.query;
    const id = req.body.user.userId;
    try {
        const queryObject = {};
        if (search){
            queryObject.name = {$regex : search, $options : "i"}
        }
        //sort
        let sorting;
        if(sort === "Newest"){
            sorting ="-createdAt";
        }
        if(sort === "Oldest"){
            sorting ="-createdAt";
        }
        if(sort === "A-Z"){
            sorting ="name";
        }
        if(sort === "Z-A"){
            sorting ="-name";
        }
        let queryResult = await Companies.findById({ _id: id}).populate({
            path:"jobPosts",
            options : { sort: sorting},
        });
        const companies = await queryResult;

        res.status(200).json({
            succes : true,
            companies,
        });

    } catch (error) {
        console.log(error);
        res.staus(404).json({ message : error.message});
    }
};

export const getCompanyByID = async(req,res,next ) =>{
    try {
        const {id} = req.params;
        const company = await Companies.findById({_id : id}).populate({
            path : "jobPosts",
            options:{
                sort: "-_id",
            },
        });

        if(!company) {
            return res.status(200).send({
                message : "Company Not Found",
                success :false ,
            });
        }
        company.password = undefined;
        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message : error.message});
    }
};
