//Initialize connection to MongoDB Atlas database
require('./config/db')

//One time code
//require('./oneTimeCode/addUserPublicIds')
//require('./oneTimeCode/addPostLikes')

var express = require('express')
var cors = require('cors')
const path = require('path')
const fs = require('fs')
const stream = require('stream')
const LoggerLibrary = require('./libraries/Logger')
const HTTPHandler = require('./libraries/HTTPHandler')
const logger = new LoggerLibrary();
const http = new HTTPHandler();
const bodyParser = require('body-parser')
const ports = [80, 443, 8080]
const servers = []

const UserRoute = require('./routes/User');

ports.forEach(port => {
    servers.push(express())
})

servers.forEach((server, index) => {
    server.use(cors())

    server.use(bodyParser.json())

    server.use('/user', UserRoute)

    server.get('/image/:imageKey', (req, res) => {
        const imageKey = req?.params?.imageKey;
        try {
            const filepath = path.resolve(process.env.UPLOAD_DIR, imageKey)

            const readableStream = fs.createReadStream(filepath)
            const passthroughStream = new stream.PassThrough()

            stream.pipeline(
                readableStream, //Input stream (data source)
                passthroughStream, //Data destination (where the data will go),
                (err) => { //Handle errors
                    if (err) {
                        logger.error(err)
                        return http.ServerError(res, 'An error occured while getting image. Please try again later.')
                    }
                }
            )
            passthroughStream.pipe(res) //Send data to user
        } catch(error) {
            http.ServerError(res, 'An error occured while getting the image. Please try again later.')
            logger.error(error)
        }
    })
    
    server.listen(ports[index], () => {
        console.log(`Server ${index + 1} is listening on port ${ports[index]}`)
    })
})