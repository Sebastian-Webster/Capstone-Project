class HTTPHandler {
    BadInput(res, error) {
        res.status(400).json({
            status: "BAD INPUT",
            error
        })
    }

    ServerError(res, error) {
        res.status(500).json({
            status: "SERVER ERROR",
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
            status: "NOT AUTHORIZED",
            error
        })
    }

    NotFound(res, error) {
        res.status(404).json({
            status: "NOT FOUND",
            error
        })
    }

    Forbidden(res, error) {
        res.status(403).json({
            status: "FORBIDDEN",
            error
        })
    }

    NotModified(res, error) {
        res.status(304).json({
            status: 'NOT MODIFIED',
            error
        })
    }
}

module.exports = HTTPHandler;