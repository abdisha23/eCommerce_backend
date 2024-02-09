const express = require('express');
const router = express.Router();
const {createCoupon, getAllCoupons, updateCoupon, deleteCoupon} = require('../controller/couponCtrl');

router.post('/', createCoupon);
// router.get('/', getAllCoupons);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);


module.exports = router;