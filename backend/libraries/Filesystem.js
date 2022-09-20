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
        fs.unlinkSync(filepath)
    }
}

module.exports = Filesystem