const {default: mongoose} = require('mongoose')

const dbConnection = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL)
        console.log('Connection Successful')
    }
    catch(err){
        console.log('Connectio Error: ' + err)
    }  
}
module.exports = dbConnection