const express = require('express');
const {
    createUser, 
    deletedUser, 
    loginUserCtrl, 
    getallUsers, 
    handleRefreshedToken,
    getUser, 
    updateUser,
    blockUser,
    unblockUser,
    logoutUser,
    updatePassword,
    forgotPassword,
    resetPassword,
    loginAdmin,
    logoutAdmin,
    getWishlist,
    saveAddress,
    userCart,
    removeProductFromCart,
    UpdateCartIemQuantity,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getMyOrders,
    getOrders,
    getOrderByUserId,
    updateOrderStatus,
    getAllOrders,
    getMonthwiseIncome,
    getYearlyTotalOrder,
    } = require('../controller/userCtrl');
const { authMiddleware, isAdmin} = require('../middlewares/authMiddleware')
const {payment, success} = require('../controller/paymentCtrl');
const router = express.Router()
router.post('/register', createUser);
router.post('/forgot-password',  forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/order/update-order/:id', authMiddleware, updateOrderStatus);
router.delete('/:id', deletedUser);
router.post('/user-login', loginUserCtrl);
router.post('/admin-login', loginAdmin);
router.post('/cart', authMiddleware, userCart);
router.delete('/delete-cart/:cartItemId', authMiddleware, removeProductFromCart);
router.put('/update-cart/:cartItemId/:newQuantity', authMiddleware, UpdateCartIemQuantity)
router.get('/admin-logout', logoutAdmin)
router.get('/all-users', getallUsers);
router.get('/get-orders', authMiddleware, getMyOrders);
router.post('/create-stripe-session', payment);
router.get('/checkout/success', success);
// router.post('/order/paymentVerification', authMiddleware, paymentVerification);
router.post('/create-order', authMiddleware, createOrder);
router.get('/getmonthwiseincome', authMiddleware, getMonthwiseIncome);
router.get('/getyearlytotalorder', authMiddleware, getYearlyTotalOrder);

// router.get('/getmyorders', authMiddleware, getOrders);
router.get('/getallorders', authMiddleware, isAdmin, getAllOrders);
router.post('/getorderbyuserid/:id', authMiddleware, isAdmin, getOrderByUserId);
router.get('/refresh-token', handleRefreshedToken );
router.get('/userlogout', logoutUser);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/:id', authMiddleware, getUser);
router.delete('/empty-cart', authMiddleware, emptyCart);
router.post('/cart/applycoupon', authMiddleware, applyCoupon);
// router.post('/cart/cash-order', authMiddleware, createOrder);
router.put('/update-user', authMiddleware, updateUser );
router.put('/save-user-address', authMiddleware, saveAddress );
router.put('/:id', updatePassword );
router.put('/block/:id', authMiddleware, isAdmin, blockUser );
router.put('/unblock/:id', authMiddleware, isAdmin, unblockUser );

 module.exports = router