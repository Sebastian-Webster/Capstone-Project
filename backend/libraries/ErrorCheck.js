const isValidObjectId = require('mongoose').isValidObjectId;

class ErrorCheck {
    checkIfValueIsValidObjectId = (key, value) => {
        if (value === undefined || value === null) {
            return `${key} must be supplied`
        }

        if (typeof value === 'object' && value.toString && typeof value.toString === 'function' && isValidObjectId(value.toString())) {
            //If the value is a objectId object
            value = value.toString()
        }

        if (typeof value !== 'string') {
            return `${key} must be an objectId string or object`
        }

        if (!isValidObjectId(value)) {
            return `${key} must be a valid objectId`
        }

        return null
    }

    checkIfValueIsNotEmptyString = (key, value) => {
        if (value === undefined || value === null) {
            return `${key} must be supplied`
        }
        
        if (typeof value !== 'string') {
            return `${key} must be a string`
        }

        if (value === '' || value.trim().length === 0) {
            return `${key} must not be an empty string`
        }

        return null
    }

    checkIfValueIsInt = (key, value) => {
        if (parseInt(value) === NaN) {
            return `${key} must be a number`
        }

        return null
    }
}

module.exports = ErrorCheck;