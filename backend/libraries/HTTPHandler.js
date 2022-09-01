class HTTPHandler {
    BadInput(res, error) {
        res.status(400).json({
            status: "FAILED",
            error
        })
    }

    ServerError(res, error) {
        res.status(500).json({
            status: "FAILED",
            error
        })
    }

    OK(res, message, data) {
        if (data) {
            res.status(200).json({
                status: "SUCCESS",
                message,
                data
            })
        } else {
            res.status(200).json({
                status: "SUCCESS",
                message
            })
        }
    }

    NotAuthorized(res, error) {
        res.status(401).json({
            status: "FAILED",
            error
        })
    }
}

module.exports = HTTPHandler;