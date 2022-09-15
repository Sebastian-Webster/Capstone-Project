const ErrorCheckLibrary = require('../backend/libraries/ErrorCheck')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const ErrorCheck = new ErrorCheckLibrary()
let tests;

console.log('Starting tests...')
console.log('Starting tests to check ErrorCheck library in backend')
console.log('Running tests to see if ErrorCheck.checkIfValueIsValudObjectId works as intended')
tests = 999_999;
for (let i = 0; i < tests; i++) {
    const objectId = new ObjectId()
    const testResult = ErrorCheck.checkIfValueIsValidObjectId('objectId', objectId)
    if (typeof testResult === 'string') {
        console.log('ObjectId:', objectId)
        console.log('Test result:', testResult)
        console.log('ObjectId type:', typeof objectId)
        throw new Error('ErrorCheck.checkIfValueIsValidObjectId is returning a string (meaning that it thinks the value is not a valid objectId even though in this test case it is)')
    }
}
console.log('Tests ran successfully')

