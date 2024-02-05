const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const asyncHandler = require('express-async-handler')
const payment = async (req, res) =>{
    console.log(req.body.cartItems)
    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        mode: "payment",
        line_items: req?.body?.cartItems?.map(item => {
            return {
                price_data: {
                    currency: "ETB",
                    product_data: {
                        name: item?.productId?.title
                    },
                    unit_amount: (item.price)*100
                },
                quantity: item.quantity
            }
        }),
        success_url: `${process.env.DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}}`,
        cancel_url: `${process.env.DOMAIN}/checkout/cancel`,
    })
    
    res.json({url: session.url})
};
const success = async(req, res) => {
    let { session_id} = req.query;
    try{
        
        //const session = stripe.checkout.sessions.retrieve(session_id);
        
        console.log(customer);
    }catch(err){
        return new Error(err);
    }
}
// const  checkout = asyncHandler( async(req, res) => {
//     const options = {
//         amount: 10000,
//         currency: "usd",
//     }
// const order = await instace.orders.create(options);
//    res.json({
//     order,
//     success: true});
// });
// const  paymentVerification =  async(req, res) => {
//     const {razorpayOrderId, razorpayPaymentId} = req.body
//    res.json({
//     razorpayOrderId,
//     razorpayPaymentId
//   });
// };

module.exports = {
    payment,
    success
}