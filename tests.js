const useSharedCode = require('./frontend/src/hooks/useSharedCode')
const calculateDifferenceBetweenNowAndUTCMillisecondsTime = useSharedCode().calculateDifferenceBetweenNowAndUTCMillisecondsTime

let testRuns;
console.log('Starting tests...')
console.log('Starting frontend useSharedCode.calculateDifferenceBetweenNowAndUTCMillisecondsTime tests (testing to see if the result is a string and that there are no 0s at the start of the string)')
testRuns = 999_999_999
for (let i = 0; i < testRuns; i++) {
    const randomNumber = Math.random() * 10 ^ 16
    const result = calculateDifferenceBetweenNowAndUTCMillisecondsTime(randomNumber)
    if (typeof result !== 'string') throw new Error('calculateDifferenceBetweenNowAndUTCMillisecondsTime is not a string! Result: ' + result + '. Random number was: ' + randomNumber)
    if (result.charAt(0) === '0') throw new Error('There was a 0 at the start of the string returned by calculateDifferenceBetweenNowAndUTCMillisecondsTime! Result: ' + result + '. Random number was: ' + randomNumber)
    if (i % 10_000_000 === 0) console.log('Ran ' + i + 'th test.')
}
console.log('Test was successful')
