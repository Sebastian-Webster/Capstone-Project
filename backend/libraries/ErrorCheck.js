const isValidObjectId = require('mongoose').isValidObjectId;

class ErrorCheck {
    checkIfValueIsValidObjectId = (key, value) => {
        if (value === undefined || value === null) {
            return `${key} must be supplied`
        }

        if (typeof value !== 'string') {
            return `${key} must be a string`
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
}

module.exports = ErrorCheck;