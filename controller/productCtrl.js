
const Product = require('../models/productModel');
const mongoose = require('mongoose')
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const validateMongoDbId = require('../utils/validateMongoDbId');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs');

const createProduct = asyncHandler( async(req, res) => {
    try {
        if (req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    }catch(err) {
        throw new Error(err)
    }
    
});
const updateProduct = asyncHandler( async(req, res) => {
    const { id } = new mongoose.Types.ObjectId(req.params);

    try{
       
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, {new: true});
        res.json(updateProduct);
    }catch(err) {
        throw new Error(err);
    }
});
const deleteProduct = asyncHandler( async(req, res) => {
    const {id} = req.params;
    try{
        const deleteProduct = await Product.findByIdAndDelete(id);
        res.json({"Deleted Product": deleteProduct});
    }catch(err) {
        throw new Error(err);
    }
});
const getProduct = asyncHandler( async(req, res) =>{
    const {id} = req.params;
    try{
        const findProduct = await Product.findById(id).populate("color");
        
        res.json(findProduct)
    }catch(err){
        throw new Error(err);
    } 
});
const getAllProducts  = asyncHandler( async(req, res) => {
    try{
        // Filtering
        const queryObj = {...req.query};
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));
        // Sorting
        if(req.query.sort){
            let sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy)

        }
        else{
            query = query.sort('-createdAt');
        }
         // limiting the fields

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }
        // pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("This Page does not exists");
        }
        const allproducts = await query;
        res.json(allproducts);
    } catch (error) {
        throw new Error(error);
    }
    });
const addToWishList = asyncHandler( async(req, res) => {
    const { _id } = req.user;
    const {prodId} = req.body;
    try{
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((_id) => _id.toString() === prodId);
        if(alreadyAdded){
            let user = await User.findByIdAndUpdate(_id,{
                $pull:  {wishlist: prodId}
            },
            { new: true }
            );
            res.json(user);  
        }
        else{
            let user = await User.findByIdAndUpdate(_id,{
                $push:  {wishlist: prodId}
            },
            { new: true }
            );
            res.json(user); 
        }
    }catch(err){
        throw new Error(err);
    }
});
const rating = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    const { star, prodId, comment } = req.body;
    try{
        const product = await Product.findById(prodId);
let alreadyRated = product.ratings.find(rating => rating.postedby.toString() === _id.toString());

if (alreadyRated) {
  const rateProduct = await Product.findOneAndUpdate(
    { "ratings.postedby": alreadyRated.postedby },
    { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
    { new: true }
  ).populate("ratings.postedby");
  await rateProduct.save();
  res.json(rateProduct);
} else {
  const rateProduct = await Product.findByIdAndUpdate(
    prodId,
    {
      $push: {
        ratings: {
          star: star,
          comment: comment,
          postedby: _id
        }
      }
    },
    { new: true }
  ).populate("ratings.postedby");
  await rateProduct.save();
  res.json(rateProduct);
}
const getAllRatings = await Product.findById(prodId);
let totalrating = getAllRatings.ratings.length;
let ratingsum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
let actualrating = Math.round(ratingsum/totalrating);
let finalProduct = await Product.findByIdAndUpdate(
    prodId, 
    { 
        totalrating: actualrating 
    },
    { 
        new: true
    }
    );
    }catch(err){
        throw new Error(err);
    }
});




// const uploadImages = asyncHandler( async(req, res) =>{
//     const{id} = req.params;
//     try {
//         const uploader = (path) => cloudinaryUploadImg(path, 'images');
//         const urls = [];
//         const files = req.files;
//         for( const file of files){
//             const {path} = file;
//             const newPath = await uploader(path);
//             urls.push(newPath);  
//             fs.unlinkSync(path); 
//         }
//         const findProduct = await Product.findByIdAndUpdate(id, {
//             images: urls.map((file) => {
//                 return file;
//             })
//         },
//         {
//             new: true
//         });
//     res.json(findProduct);
//     }catch(err){
//         throw new Error(err);
//     }
//     });


module.exports = {
    createProduct, 
    getProduct, 
    getAllProducts, 
    updateProduct, 
    deleteProduct,
    addToWishList,
    rating,
};