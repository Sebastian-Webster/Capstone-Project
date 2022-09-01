const TextPost = require('../models/TextPost')
const ImagePost = require('../models/ImagePost')

TextPost.find({}).then(results => {
    results.forEach(item => {
        TextPost.findOneAndUpdate({_id: item._id}, {likes: []}).then(() => {
            console.log('Updated Text Post with id: ' + item._id)
        }).catch(error => console.error(error))
    })
})

ImagePost.find({}).then(results => {
    results.forEach(item => {
        ImagePost.findOneAndUpdate({_id: item._id}, {likes: []}).then(() => {
            console.log('Updated Image Post with id: ' + item._id)
        }).catch(console.error)
    })
})