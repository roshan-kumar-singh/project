module.exports = (req, res, next) => {
    var token = req.header('authorization');
    if (token) {
        const decodeToken = (token) => {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const buff = new Buffer(base64, 'base64');
            const payloadinit = buff.toString('ascii');
            const payload = JSON.parse(payloadinit);
            return payload;
        };

        req.user = decodeToken(token);

        next();
    } else {
        res.status(403).json({
            status: 'error',
            msg: 'token not found',
        });
    }
};
