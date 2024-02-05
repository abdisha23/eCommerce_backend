const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');

const createBrand = asyncHandler( async(req, res) => {
    try{
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    }catch(err){
        throw new Error(err); 
    }
});
const updateBrand = asyncHandler( async(req, res) => {
    const {id} = req.params;
    try{
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {new: true});
        res.json(updatedBrand);
    }catch(err){
        throw new Error(err);
    }
});
const deleteBrand = asyncHandler( async(req, res) => {
    const {id} = req.params;
    try{
        const deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand);
    }catch(err){
        throw new Error(err);
    }
});
const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getaBrand = await Brand.findById(id);
      res.json(getaBrand);
    } catch (error) {
      throw new Error(error);
    }
});
const getallBrands = asyncHandler(async (req, res) => {
    try {
      const getallBrands = await Brand.find();
      res.json(getallBrands);
    } catch (error) {
      throw new Error(error);s
    }
  });

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getallBrands};