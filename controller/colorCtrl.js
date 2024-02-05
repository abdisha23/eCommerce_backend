const Color = require('../models/colorModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongoDbId');

const createColor = asyncHandler( async(req, res) => {
    try{
        const newColor = await Color.create(req.body);
        res.json(newColor);
    }catch(err){
        throw new Error(err); 
    }
});
const updateColor = asyncHandler( async(req, res) => {
    const {id} = req.params;
    try{
        const updatedColor = await Color.findByIdAndUpdate(id, req.body, {new: true});
        res.json(updatedColor);
    }catch(err){
        throw new Error(err);
    }
});
const deleteColor = asyncHandler( async(req, res) => {
    const {id} = req.params;
    try{
        const deletedColor = await Color.findByIdAndDelete(id);
        res.json(deletedColor);
    }catch(err){
        throw new Error(err);
    }
});
const getColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getaColor = await Color.findById(id);
      res.json(getaColor);
    } catch (error) {
      throw new Error(error);
    }
});
const getallColors = asyncHandler(async (req, res) => {
    try {
      const getallColors = await Color.find();
      res.json(getallColors);
    } catch (error) {
      throw new Error(error);s
    }
  });

module.exports = {
    createColor,
    updateColor,
    deleteColor,
    getColor,
    getallColors};