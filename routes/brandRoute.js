const express = require('express');
const router = express.Router();
const {
    createBrand, 
    updateBrand, 
    deleteBrand,
    getBrand,
    getallBrands} = require('../controller/brandCtrl');


router.post('/', createBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);
router.get('/:id', getBrand);
router.get('/', getallBrands);

module.exports = router;