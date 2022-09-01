const User = require('../models/User')
const {v4: uuidv4} = require('uuid')

User.find({}).then(users => {
    users.forEach(user => {
        User.findOneAndUpdate({_id: user._id}, {publicId: uuidv4()}).then(() => {
            console.log('Updated user with ID: ' + user._id)
        }).catch(error => {
            console.error(error)
        })
    })
}).catch(error => console.error(error))