const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImagePostSchema = new Schema({
    creatorId: mongoose.Schema.Types.ObjectId,
    imageKey: String,
    title: String,
    body: String,
    datePosted: Number,
    likes: {type: Array, default: []}
})

const ImagePost = mongoose.model('ImagePost', ImagePostSchema)

module.exports = ImagePost