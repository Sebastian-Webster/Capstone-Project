const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    creatorId: mongoose.Schema.Types.ObjectId,
    postId: mongoose.Schema.Types.ObjectId,
    body: String,
    datePosted: Number
})

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment