const {default: mongoose} = require('mongoose')

const dbConnection = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL||5001)
        console.log('Connection Successful')
    }
    catch(err){
        console.log('Connectio Error: ' + err)
    }  
}
module.exports = dbConnection