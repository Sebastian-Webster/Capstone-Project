const fs = require('fs')

class Filesystem {
    deleteFileAsync = (filepath) => {
        return new Promise((resolve, reject) => {
            fs.unlink(filepath, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })
    }

    deleteFileSync = (filepath) => {
        return new Promise((resolve, reject) => {
            try {
                fs.unlinkSync(filepath)
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = Filesystem