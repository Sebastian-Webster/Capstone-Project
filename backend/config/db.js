require('dotenv').config();
const mongoose = require('mongoose');
const Logger = require('../libraries/Logger')
const logger = new Logger()

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    logger.log("DB Connected"); 
}).catch((err) => logger.error(err));