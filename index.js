const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const dotenv = require('dotenv').config()
const dbConnection = require('./config/dbConnection')
const {notFound, errorHandler} = require('./middlewares/errorHandler')
const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const prodCatRouter = require('./routes/prodCatRoute');
const blogCatRouter = require('./routes/blogCatRoute');
const brandRouter = require('./routes/brandRoute');
const colorRouter = require('./routes/colorRoute');
const enqRouter = require('./routes/enqRoute');
const couponRouter = require('./routes/couponRoute');
const uploadRouter  = require('./routes/uploadRoute');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
dbConnection();
app.use(cors());
app.use(morgan("dev"));
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json()) //For JSON requests
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/category', prodCatRouter);
app.use('/api/blogcategory', blogCatRouter);
app.use('/api/brand', brandRouter);
app.use('/api/color', colorRouter);
app.use('/api/enquiry', enqRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/upload', uploadRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})