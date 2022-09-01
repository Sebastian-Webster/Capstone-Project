class Logger {

    log(log) {
        console.log(log)
    }

    error(error) {
        console.error('ERROR AT: [' + new Date() + '] ' + String(error))
    }
}

module.exports = Logger;