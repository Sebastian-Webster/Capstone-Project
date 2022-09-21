const ErrorCheckLibrary = require('../backend/libraries/ErrorCheck')
const FilesystemLibrary = require('../backend/libraries/Filesystem')
const GeneralLibrary = require('../backend/libraries/General')
const HTTPHandler = require('../backend/libraries/HTTPHandler')
const fs = require('fs')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const ErrorCheck = new ErrorCheckLibrary()
const filesystem = new FilesystemLibrary()
const general = new GeneralLibrary()
const http = new HTTPHandler()
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
console.log('Starting tests to see if the GeneralLibrary is working as intended')
console.log('Running tests to see if general.calculateHowManyItemsToSend is working as intended')
function testGeneralDotCalculateHowManyItemsToSend() {
    let arrayLength = 20;
    let skip = 14;
    let limit = 10;
    let testResult = general.calculateHowManyItemsToSend(arrayLength, limit, skip)
    let expectedResult = 6
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('testResult does not equal expectedResult when running test for general.calculateHowManyItemsToSend')
    }
    skip = 24
    testResult = general.calculateHowManyItemsToSend(arrayLength, limit, skip)
    expectedResult = 0
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('testResult does not equal expectedResult when running test for general.calculateHowManyItemsToSend')
    }
    skip = 0;
    testResult = general.calculateHowManyItemsToSend(arrayLength, limit, skip)
    expectedResult = 10
    if (testResult !== expectedResult) {
        console.log('testResult:', testResult)
        console.log('expectedResult:', expectedResult)
        throw new Error('testResult does not equal expectedResult when running test for general.calculateHowManyItemsToSend')
    }
}
testGeneralDotCalculateHowManyItemsToSend()
console.log('Running tests to see if general.returnPublicProfileInformation is working as intended')
function testGeneralDotReturnPublicProfileInformation() {
    const expectedKeys = ['profileImageKey', 'name', 'followers', 'following', 'publicId', 'hideFollowing', 'hideFollowers']
    let userObj = {
        _id: 10,
        __v: 0,
        name: 'Username',
        privateItem: 'This is a private item that should not be shown in the returned object',
        profileImageKey: 'image key',
        privateItemTwo: 'this should not be found in the returned object',
        followers: ['followerOne', 'followerTwo'],
        lol: 0,
        hello: false,
        following: ['followingOne', 'randomGuy'],
        privateId: 'this is private',
        publicId: 'this is public',
        veryPrivateId: 'Cannot be released to anyone',
        hideFollowing: true,
        extremelyPrivateInformation: '123456789- ',
        hideFollowers: false,
        randomItem: 'This is a random item. Although it is random, it must not be shared with anyone but the user that this very random item belongs to.',
        oompa: 'loompa'
    }
    const testResult = general.returnPublicProfileInformation(userObj)
    for (const key of Object.keys(testResult)) {
        if (!expectedKeys.includes(key)) {
            throw new Error(`${key} was found in public profile information returned from general.returnPublicProfileInformation. This is not public information and should not be returned.`)
        }
    }
}
testGeneralDotReturnPublicProfileInformation()
console.log('Starting tests to see if the HTTPHandler library is working as intended')
class HTTPHandlerTester {
    constructor() {
        this.statusReturned = null;
        this.jsonReturned = null
    }

    status(status) {
        this.statusReturned = status
        return this
    }

    json(json) {
        this.jsonReturned = json
        return this
    }

    returnResults() {
        return {status: this.statusReturned, json: this.jsonReturned}
    }
}
console.log('Running test to see if http.BadInput works as intended')
function testingHTTPDotBadInput() {
    const tester = new HTTPHandlerTester()
    const error = 'An error occured'
    http.BadInput(tester, error)
    const result = tester.returnResults()
    if (result.status !== 400) {
        throw new Error(`http.BadInput returned status code ${result.status} instead of returning code 400`)
    }
    if (result.json.status !== 'BAD INPUT') {
        throw new Error(`http.BadInput returned json.status ${result.json.status} instead of returning BAD INPUT`)
    }
    if (result.json.error !== error) {
        throw new Error(`http.BadInput returned json.error ${result.json.error} instead of returning ${error}`)
    }
    console.log('Results from http.BadInput test:', result)
}
testingHTTPDotBadInput()
function testingHTTPDotServerError() {
    const tester = new HTTPHandlerTester()
    const error = 'An error occured. A very bad one. Yes indeed. This is an error we need to fix. Yes. Very much so. Indubitably sir.'
    http.ServerError(tester, error)
    const result = tester.returnResults()
    if (result.status !== 500) {
        throw new Error(`http.ServerError returned status code ${result.status} instead of returning code 500`)
    }
    if (result.json.status !== 'SERVER ERROR') {
        throw new Error(`http.ServerError returned json.status ${result.json.status} instead of returning SERVER ERROR`)
    }
    if (result.json.error !== error) {
        throw new Error(`http.ServerError returned json.error ${result.json.error} instead of returning ${error}`)
    }
    console.log('Results from http.ServerError test:', result)
}
testingHTTPDotServerError()
function testingHTTPDotOKWithoutData() {
    const tester = new HTTPHandlerTester()
    const message = 'A thing was successfully executed. Good job! This has worked quite well. Very good job indeed.'
    http.OK(tester, message)
    const result = tester.returnResults()
    if (result.status !== 200) {
        throw new Error(`http.OK returned status code ${result.status} instead of returning code 200`)
    }
    if (result.json.status !== 'SUCCESS') {
        throw new Error(`http.OK returned json.status ${result.json.status} instead of returning SUCCESS`)
    }
    if (result.json.message !== message) {
        throw new Error(`http.OK returned json.message ${result.json.message} instead of returning ${message}`)
    }
    if (result.json.data !== undefined) {
        throw new Error(`http.OK returned json.data ${result.json.data} instead of returning undefined`)
    }
    console.log('Results from http.OK without data test:', result)
}
testingHTTPDotOKWithoutData()
function testingHTTPDotOKWithData() {
    const tester = new HTTPHandlerTester()
    const message = 'Good job.'
    const data = 'This is some data.'
    http.OK(tester, message, data)
    const result = tester.returnResults()
    if (result.status !== 200) {
        throw new Error(`http.OK returned status code ${result.status} instead of returning code 200`)
    }
    if (result.json.status !== 'SUCCESS') {
        throw new Error(`http.OK returned json.status ${result.json.status} instead of returning SUCCESS`)
    }
    if (result.json.message !== message) {
        throw new Error(`http.OK returned json.message ${result.json.message} instead of returning ${message}`)
    }
    if (result.json.data !== data) {
        throw new Error(`http.OK returned json.data ${result.json.data} instead of returning ${data}`)
    }
    console.log('Results from http.OK with data test:', result)
}
testingHTTPDotOKWithData()
function testingHTTPDotNotAuthorized() {
    const tester = new HTTPHandlerTester()
    const error = 'This is an error'
    http.NotAuthorized(tester, error)
    const result = tester.returnResults()
    if (result.status !== 401) {
        throw new Error(`http.NotAuthorized returned status code ${result.status} instead of returning code 401`)
    }
    if (result.json.status !== 'NOT AUTHORIZED') {
        throw new Error(`http.NotAuthorized returned json.status ${result.json.status} instead of returning NOT AUTHORIZED`)
    }
    if (result.json.error !== error) {
        throw new Error(`http.NotAuthorized returned json.error ${result.json.error} instead of returning ${error}`)
    }
    console.log('http.NotAuthorized test:', result)
}
testingHTTPDotNotAuthorized()
function testingHTTPDotNotFound() {
    const tester = new HTTPHandlerTester()
    const error = 'We could not find your data. Whoopsies.'
    http.NotFound(tester, error)
    const result = tester.returnResults()
    if (result.status !== 404) {
        throw new Error(`http.NotFound returned status code ${result.status} instead of returning code 404`)
    }
    if (result.json.status !== 'NOT FOUND') {
        throw new Error(`http.NotFound returned json.status ${result.json.status} instead of returning NOT FOUND`)
    }
    if (result.json.error !== error) {
        throw new Error(`http.NotFound returned json.error ${result.json.error} instead of returning ${error}`)
    }
    console.log('http.NotFound test:', result)
}
testingHTTPDotNotFound()
function testingHTTPDotForbidden() {
    const tester = new HTTPHandlerTester()
    const error = 'You are forbidden to do this certain thing that you are trying to do.'
    http.Forbidden(tester, error)
    const result = tester.returnResults()
    if (result.status !== 403) {
        throw new Error(`http.Forbidden returned status code ${result.status} instead of returning code 403`)
    }
    if (result.json.status !== 'FORBIDDEN') {
        throw new Error(`http.Forbidden returned json.status ${result.json.status} instead of returning FORBIDDEN`)
    }
    if (result.json.error !== error) {
        throw new Error(`http.Forbidden returned json.error ${result.json.error} instead of returning ${error}`)
    }
    console.log('http.Forbidden test:', result)
}
testingHTTPDotForbidden()
function testingHTTPDotNotModified() {
    const tester = new HTTPHandlerTester()
    const error = 'You supplied data that is already in the database. The data did not get modified.'
    http.NotModified(tester, error)
    const result = tester.returnResults()
    if (result.status !== 304) {
        throw new Error(`http.NotModified returned status code ${result.status} instead of returning code 304`)
    }
    if (result.json.status !== 'NOT MODIFIED') {
        throw new Error(`http.NotModified returned json.status ${result.json.status} instead of returning NOT MODIFIED`)
    }
    if (result.json.error !== error) {
        throw new Error(`http.NotModified returned json.error ${result.json.error} instead of returning ${error}`)
    }
    console.log('http.NotModified test:', result)
}
testingHTTPDotNotModified()