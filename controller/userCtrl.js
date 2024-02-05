const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const generateToken = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongoDbId');
const generateNewToken = require('../config/refreshToken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const createUser = asyncHandler( async (req, res) => {
        try{
          const email = req.body.email;
          const findAdmin = await User.findOne({email: email});
          if(!findAdmin){
              // create a new user
              const newUser = User.create(req.body);
              res.json({
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  email: req.body.email,
                  phone: req.body.phone,
                  password: req.body.password     
              })
          }
          else{
            throw err = new Error('This User already exists!');
         }
        }catch(err){
          throw new Error(err);

        }
        
    }
);
const deletedUser = asyncHandler(
    async (req, res) => {
        const {id} = req.params;
        validateMongoDbId(id);
        try{
            const deleteUser = await User.findByIdAndDelete(id);
            res.json(deleteUser);
        }
        catch(error){
            throw new Error(error)
        }
    });
const blockUser = asyncHandler (async(req, res) => {
    const {id} = req.params;
    try{
        const block = await User.findByIdAndUpdate(id, 
            {
              isBlocked: true,
            },
            {
               new: true,
            },
          );
          res.json({Message: "User Blocked!"})
    }catch(error){
        throw new Error(error)
    }
});

const unblockUser = asyncHandler (async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
     const unblock = await User.findByIdAndUpdate(id, 
          {
            isBlocked: false, 
          },
          {
            new: true,
          },
        );
        res.json({Message: "User Unblocked!"});
    }catch(error){
        throw new Error(error);
    }
});
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
      const newToken = await generateNewToken(findUser?._id);
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
            newToken: newToken,
        },
        { new: true }
      );
      res.cookie("newToken", newToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        _id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        phone: findUser?.phone,
        token: generateToken(findUser?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  });


const loginAdmin = asyncHandler (async(req,res) => {
    const {email, password} = req.body;
    //Check if user exists
    const findAdmin = await User.findOne({email});
    if(findAdmin.role !== 'admin'){
        throw new Error(" Not Authorized!")
    }
    const findUser = await User.findOne({ email });
    if(findAdmin && findAdmin.isPasswordMatched(password)){
        const newToken = await generateNewToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(findAdmin?._id,
            {
                newToken: newToken,
            },
            {
                new: true,
            });
        res.cookie("Refreshed Token",newToken,{
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastName,
            email: findAdmin?.email,
            phone: findAdmin?.phone,
            password: findAdmin?.password,
            token: generateToken(findAdmin?._id)
        })
    }
    else{
        throw new Error('Invalid Credentials!')
    }
});
//Handle Refreshed token
const handleRefreshedToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.newToken) throw new Error("No Refresh Token in Cookies");
    const newToken = cookie.newToken;
    const user = await User.findOne({ newToken });
    if (!user) throw new Error(" No Refresh token present in db or not matched");
    jwt.verify(newToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        throw new Error("There is something wrong with refresh token");
      }
      const accessToken = generateToken(user?._id);
      res.json({ accessToken });
    });
  });
//Logout User
const logoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.newToken) throw new Error("No Refresh Token in Cookies");
    const newToken = cookie.newToken;
    console.log(cookie.newToken)
    const user = await User.findOne({ newToken });
    if (!user) {
      res.clearCookie("newToken", {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate({newToken}, {
      newToken: "",
    });
    res.clearCookie("newToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // forbidden
  });
  const logoutAdmin = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.newToken) throw new Error("No Refresh Token in Cookies");
    const newToken = cookie.newToken;
    console.log(cookie.newToken)
    const user = await User.findOne({ newToken });
    if (!user || user.role !== "admin"){
      res.clearCookie("newToken", {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate({newToken}, {
      newToken: "",
    });
    res.clearCookie("newToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // forbidden
  });
// Update User
const updateUser = asyncHandler( async (req, res) => {
    const {_id} = req.user;
    const {firstname, lastname,email, phone } = req.body
    validateMongoDbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: phone,
            
        }, 
        {
            new: true,
        })
             updatedUser.save();
            res.json(updatedUser);
    }catch(error) {
        throw new Error(error)
    } 
});

const saveAddress = asyncHandler( async(req,res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate(_id, 
          {
            address: req.body.address 
          }, 
          {
              new: true,
          });   
              res.json(updatedUser);
      }catch(error) {
          throw new Error(error);
    } 
});
// Get all users
const getallUsers = asyncHandler( async(req, res) =>{
    try{
        const AllUsers = await User.find().populate("wishlist");
        res.json(AllUsers);
    }
    catch(error){ 
        throw new Error(error)

    }

});
const getUser = asyncHandler( async (req, res) =>{
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const user = await User.findById(id);
        res.json({user})
    }
    catch(error){
        throw new Error(error)
    }
});
const updatePassword = asyncHandler( async(req, res) => {
    const {_id}  = req.user;
    const {password} = req.body;
    validateMongoDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password; 
        const updatedPassword = user.save();
        res.json(updatedPassword);
    }
    else{
        res.json(user);
    }
});
const forgotPassword = asyncHandler( async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error("User not found with this email!");
    try{
        const findUser = await User.findOne({email});
        const token = await findUser.createPasswordResetToken();
        await findUser.save();
        const resetURL = `Hi, Please follow this link to reset your password. This link is valid till 10 minutes fron now. <a href='http://localhost:3000/reset-password/${token}'>Click Here </a>`;
        const data = {
            to: email,
            text: "Hey User",
            subject: "forgot Password Link",
            htm: resetURL
        };
        sendEmail(data);
        res.json(token);
    }catch(err){
        throw new Error(err)
    }
});
const resetPassword = asyncHandler( async(req, res) => {
    const {password} = req.body;
    const {token} = req.params;
    const hashToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: {$gt: Date.now()}
    });
    if(!user) throw new Error('Token Expired, Please try again later!');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user)

});

const userCart = asyncHandler(async (req, res) => {
    const { productId, color, quantity, price } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      
      let newCart = await new Cart({
        userId: _id,
        productId,  
        color,
        quantity,
        price, 
      }).save();
      res.json(newCart);
    } catch (error) {
      throw new Error(error);
    }
  });
const UpdateCartIemQuantity = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId,newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({ userId: _id, _id: cartItemId });
    cartItem.quantity = newQuantity;
    cartItem.save()
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
}); 
const removeProductFromCart = asyncHandler( async(req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  validateMongoDbId(_id);
  try {
    const deleteCart = await Cart.deleteOne({ userId: _id, _id: cartItemId })
  
    res.json(deleteCart);
  } catch (error) {
    throw new Error(error);
  }
});
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id }).populate(
      "productId"
    ).populate("color");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});
const getWishlist = asyncHandler( async(req, res) => {
    const {_id} = req.user;
    try{
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser);
    }catch(err){
        throw new Error(err);
    }
});
const createOrder = asyncHandler(async (req, res) => {
  const {shippingInfo, orderItems } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const order = await Order.create({
      user: _id,
      shippingInfo: shippingInfo,
      orderItems: orderItems,
     });
      res.json({
        order, 
        success: true,
  });

    // if (!COD) throw new Error("Create cash order failed");
    // const user = await User.findById(_id);
    // let userCart = await Cart.findOne({ orderby: user._id });
    // let finalAmout = 0;
    // if (couponApplied && userCart.totalAfterDiscount) {
    //   finalAmout = userCart.totalAfterDiscount;
    // } else {
    //   finalAmout = userCart.cartTotal;
    // }

    // let newOrder = await new Order({
    //   products: userCart.products,
    //   paymentIntent: {
    //     id: uniqid(),
    //     method: "COD",
    //     amount: finalAmout,
    //     status: "Cash on Delivery",
    //     created: Date.now(),
    //     currency: "ETB",
    //   },
    //   orderby: user._id,
    //   orderStatus: "Cash on Delivery",
    // }).save();
    // let update = userCart.products.map((item) => {
    //   return {
    //     updateOne: {
    //       filter: { _id: item.product._id },
    //       update: { $inc: { quantity: - item.count, sold: + item.count } },
    //     },
    //   };
    // });
    // const updated = await Product.bulkWrite(update, {});
    // res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
  }
});
const getMyOrders = asyncHandler( async(req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.findOne({user: _id}).populate("user").populate("orderItems.product").populate("orderItems.color");
    res.json(orders);
  }catch(error) {
    throw new Error(error);
  }
  
});
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("orderItems.product")
      .populate("user")
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});
const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ user: id })
      .populate("orderItems.product")
      .populate("user")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});
const getMonthwiseIncome = asyncHandler( async(req, res) => {
  let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for(let index = 0; index < 11; index++){
    d.setMonth = (d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          month: "$month"
        },
        amount: {$sum:"$totalamountAfterDiscount"},
        count: {$sum: 1}
      }
    }
  ])
  res.json(data);
});
const getYearlyTotalOrder = asyncHandler( async(req, res) => {
  let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for(let index = 0; index < 11; index++){
    d.setMonth = (d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        count: {$sum: 1},
        amount: {$sum: "$totalpriceAfterDiscount"}
      }
    }
  ])
  res.json(data);
});
module.exports = {
    createUser, 
    deletedUser, 
    loginUserCtrl, 
    getallUsers, 
    getUser, 
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshedToken,
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
    updateOrderStatus,
    getAllOrders,
    getOrderByUserId,
    getMonthwiseIncome,
    getYearlyTotalOrder
};
