const express = require('express');
const router = express.Router();
const {
    createCategory, 
    updateCategory, 
    deleteCategory,
    getCategory,
    getallCategory} = require('../controller/blogCatCtrl');


router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.get('/:id', getCategory);
router.get('/', getallCategory);

module.exports = router;