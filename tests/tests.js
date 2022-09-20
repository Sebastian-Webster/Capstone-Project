const ErrorCheckLibrary = require('../backend/libraries/ErrorCheck')
const FilesystemLibrary = require('../backend/libraries/Filesystem')
const fs = require('fs')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const ErrorCheck = new ErrorCheckLibrary()
const filesystem = new FilesystemLibrary()
let tests;

console.log('Starting tests...')
console.log('Starting tests to check ErrorCheck library in backend')
console.log('Running tests to see if ErrorCheck.checkIfValueIsValidObjectId works as intended')
tests = 999;
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
    objectId = objectId.toString()
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
    objectId = objectId.toString()
    const key = 'objectId'
    const testResult = ErrorCheck.checkIfValueIsValidObjectId(key, objectId)
    const expectedResult = `${key} must be a valid objectId`
    if (typeof testResult !== 'string') {
        console.log('ObjectId:', objectId)
        console.log('Test result:', testResult)
        console.log('ObjectId type:', typeof objectId)
        throw new Error('ErrorCheck.checkIfValueIsValidObjectId is returning null (meaning that it thinks the value is a valid objectId even though in this case it is not)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsValidObjectId')
    }
}
console.log('Running tests to see if ErrorCheck.checkIfValueIsNotEmptyString is working as intended')
for (let i = 0; i < tests; i++) {
    let string;
    const key = 'string'
    const testResult = ErrorCheck.checkIfValueIsNotEmptyString(key, string)
    const expectedResult = `${key} must be supplied`
    if (typeof testResult !== 'string') {
        console.log('String:', string)
        console.log('Test result:', testResult)
        console.log('String type:', typeof string)
        throw new Error('ErrorCheck.checkIfValueIsNotEmptyString is returning null (meaning that it thinks it is a not empty string even though it is not)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsNotEmptyString')
    }
}
for (let i = 0; i < tests; i++) {
    let string = true;
    const key = 'string'
    const testResult = ErrorCheck.checkIfValueIsNotEmptyString(key, string)
    const expectedResult = `${key} must be a string`
    if (typeof testResult !== 'string') {
        console.log('String:', string)
        console.log('Test result:', testResult)
        console.log('String type:', typeof string)
        throw new Error('ErrorCheck.checkIfValueIsNotEmptyString is returning null (meaning that it thinks it is a not empty string even though it is not)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsNotEmptyString')
    }
}
for (let i = 0; i < tests; i++) {
    let string = ''
    const key = 'string'
    const testResult = ErrorCheck.checkIfValueIsNotEmptyString(key, string)
    const expectedResult = `${key} must not be an empty string`
    if (typeof testResult !== 'string') {
        console.log('String:', string)
        console.log('Test result:', testResult)
        console.log('String type:', typeof string)
        throw new Error('ErrorCheck.checkIfValueIsNotEmptyString is returning null (meaning that it thinks it is a not empty string even though it is not)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsNotEmptyString')
    }
}
for (let i = 0; i < tests; i++) {
    let string = '   '
    const key = 'string'
    const testResult = ErrorCheck.checkIfValueIsNotEmptyString(key, string)
    const expectedResult = `${key} must not be an empty string`
    if (typeof testResult !== 'string') {
        console.log('String:', string)
        console.log('Test result:', testResult)
        console.log('String type:', typeof string)
        throw new Error('ErrorCheck.checkIfValueIsNotEmptyString is returning null (meaning that it thinks it is a not empty string even though it is not)')
    }
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsNotEmptyString')
    }
}
for (let i = 0; i < tests; i++) {
    let string = 'this is a not empty string'
    const key = 'string'
    const testResult = ErrorCheck.checkIfValueIsNotEmptyString(key, string)
    const expectedResult = null
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsNotEmptyString')
    }
}
console.log('Running tests to see if ErrorCheck.checkIfValueIsInt works as intended')
for (let i = 0; i < tests; i++) {
    let int = true;
    const key = 'int'
    const testResult = ErrorCheck.checkIfValueIsInt(key, int)
    const expectedResult = `${key} must be a number`
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        console.log('typeof testResult:', typeof testResult)
        console.log('typeof expectedResult:', typeof expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsInt')
    }
}
for (let i = 0; i < tests; i++) {
    let int = {};
    const key = 'int'
    const testResult = ErrorCheck.checkIfValueIsInt(key, int)
    const expectedResult = `${key} must be a number`
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        console.log('typeof testResult:', typeof testResult)
        console.log('typeof expectedResult:', typeof expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsInt')
    }
}
for (let i = 0; i < tests; i++) {
    let int = [];
    const key = 'int'
    const testResult = ErrorCheck.checkIfValueIsInt(key, int)
    const expectedResult = `${key} must be a number`
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        console.log('typeof testResult:', typeof testResult)
        console.log('typeof expectedResult:', typeof expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsInt')
    }
}
for (let i = 0; i < tests; i++) {
    let int = 'I am a string';
    const key = 'int'
    const testResult = ErrorCheck.checkIfValueIsInt(key, int)
    const expectedResult = `${key} must be a number`
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        console.log('typeof testResult:', typeof testResult)
        console.log('typeof expectedResult:', typeof expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsInt')
    }
}
for (let i = 0; i < tests; i++) {
    let int = i;
    const key = 'int'
    const testResult = ErrorCheck.checkIfValueIsInt(key, int)
    const expectedResult = null
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        console.log('typeof testResult:', typeof testResult)
        console.log('typeof expectedResult:', typeof expectedResult)
        throw new Error('expected result was not test result for ErrorCheck.checkIfValueIsInt')
    }
}
console.log('Tests for the ErrorCheck backend library were successful')
console.log('Starting tests to see if the FilesystemLibrary is working as intended')
console.log('Running tests to see if filesystem.deleteFileSync works as intended')
for (let i = 0; i < tests; i++) {
    fs.writeFileSync(`testingFileSync${i}`, `This is the ${i} test file`)
    const exists = fs.existsSync(`testingFileSync${i}`)
    if (!exists) {
        throw new Error('fs.writeFileSync did not write a file. THIS IS NOT A SEBMEDIA ERROR. IT IS A TEST ERROR.')
    }
    filesystem.deleteFileSync(`testingFileSync${i}`)
    const existsAfterDelete = fs.existsSync(`testingFileSync${i}`)
    if (existsAfterDelete) {
        throw new Error(`filesystem.deleteFileSync DID NOT delete file named: testingFileSync${i}`)
    }
}
console.log('Running tests to see if filesystem.deleteFileAsync works as intended')
for (let i = 0; i < tests; i++) {
    fs.writeFile(`testing${i}`, 'This is a test file', (err) => {
        if (err) {
            console.error('ERROR OCCURED FROM TESTING')
            console.error('THIS ERROR IS NOT RELATED TO SEBMEDIA. THIS IS A TEST ERROR. NOT A FUNCTION ERROR.')
            throw new Error(error)
        }
        try {
            const exists = fs.existsSync(`testing${i}`)
            if (!exists) {
                throw new Error('fs.writeFile did not create file called testing. THIS IS NOT A SEBMEDIA ERROR. IT IS A TEST ERROR')
            }
        } catch (error) {
            console.error('ERROR OCCURED FROM TESTING')
            console.error('THIS ERROR IS NOT RELATED TO SEBMEDIA. THIS IS A TEST ERROR. NOT A FUNCTION ERROR.')
            throw new Error(error)
        }
        filesystem.deleteFileAsync(`testing${i}`).then(() => {
            const exists = fs.existsSync(`testing${i}`)
            if (exists) {
                throw new Error('filesystem.deleteFileAsync DID NOT delete file.')
            }
        })
    })
}