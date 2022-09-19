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
        res.status(200).json({
            status: "SUCCESS",
            message,
            data
        })
    }

    NotAuthorized(res, error) {
        res.status(401).json({
            status: "FAILED",
            error
        })
    }

    NotFound(res, error) {
        res.status(404).json({
            status: "FAILED",
            error
        })
    }

    Forbidden(res, error) {
        res.status(403).json({
            status: "FORBIDDEN",
            error
        })
    }
}

module.exports = HTTPHandler;