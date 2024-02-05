const express = require('express');
const router = express.Router();
const { 
    uploadImages, 
    deleteImages} = require('../controller/uploadCtrl');
const { uploadPhoto, productImgResize, blogImgResize} = require('../middlewares/uploadImages');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware'); 

router.post('/', 
  
  uploadPhoto.array('images', 5),
  productImgResize, 
  uploadImages);
router.delete('/', authMiddleware, isAdmin, deleteImages)


module.exports = router;