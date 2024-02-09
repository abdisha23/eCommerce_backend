const express = require('express');
const router = express.Router();
const {
    createProduct, 
    getProduct, 
    getAllProducts, 
    updateProduct, 
    deleteProduct,
    addToWishList,
    rating,
  } = require('../controller/productCtrl');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleware'); 

router.post('/', createProduct);
router.get('/:id', getProduct);
router.put('/wishlist', authMiddleware, addToWishList);
// router.get('/', getAllProducts);
// router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.put('/rating', authMiddleware, rating);


module.exports = router;