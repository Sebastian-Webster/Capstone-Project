const ErrorCheckLibrary = require('../backend/libraries/ErrorCheck')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const ErrorCheck = new ErrorCheckLibrary()
let tests;

console.log('Starting tests...')
console.log('Starting tests to check ErrorCheck library in backend')
console.log('Running tests to see if ErrorCheck.checkIfValueIsValudObjectId works as intended')
tests = 999_999_999;
for (let i = 0; i < tests; i++) {
    const objectId = new ObjectId()
    const testResult = ErrorCheck.checkIfValueIsValidObjectId('objectId', objectId)
    const expectedResult = null
    if (typeof testResult === 'string') {
        console.log('ObjectId:', objectId)
        console.log('Test result:', testResult)
        console.log('ObjectId type:', typeof objectId)
        throw new Error('ErrorCheck.checkIfValueIsValidObjectId is returning a string (meaning that it thinks the value is not a valid objectId even though in this test case it is)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsValidObjectId')
    }
}
for (let i = 0; i < tests; i++) {
    let objectId = 'abcdefghijklmnopqrstuvwxyz' //26 character string
    objectId = objectId.split('').sort((a,b) => Math.random() > 0.5 ? 1 : -1)
    const key = 'objectId'
    const testResult = ErrorCheck.checkIfValueIsValidObjectId(key, objectId)
    const expectedResult = `${key} must be a valid objectId`
    if (typeof testResult !== 'string') {
        console.log('ObjectId:', objectId)
        console.log('Test result:', testResult)
        console.log('ObjectId type:', typeof objectId)
        throw new Error('ErrorCheck.checkIfValueIsValidObjectId is returning null (meaning that it thinks the value is a valid obhectId even though in this case it is not)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsValidObjectId')
    }
}
for (let i = 0; i < tests; i++) {
    let objectId = 'abcdefghijklmnopqrstuvwx' //24 character string
    objectId = objectId.split('').sort((a,b) => Math.random() > 0.5 ? 1 : -1)
    const key = 'objectId'
    const testResult = ErrorCheck.checkIfValueIsValidObjectId(key, objectId)
    const expectedResult = `${key} must be a valid objectId`
    if (typeof testResult !== 'string') {
        console.log('ObjectId:', objectId)
        console.log('Test result:', testResult)
        console.log('ObjectId type:', typeof objectId)
        throw new Error('ErrorCheck.checkIfValueIsValidObjectId is returning null (meaning that it thinks the value is a valid obhectId even though in this case it is not)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsValidObjectId')
    }
}
console.log('Tests ran successfully')

