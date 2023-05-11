const axios = require('axios');
const sandboxUtil = require('../../utils/sandbox.util')
const ApiError = require('../../errors/ApiError')
const fetch = require("node-fetch")
class TanController {
    searchTan = async (req, res, next) => {
        if (req.query.tan === "" || req.query.tan === undefined)
            return next(ApiError.badRequest("either query parameter aadhar is missing"))

        let token = await sandboxUtil.getSandboxAuthToken()
        console.log(token)
        await axios.get(`${process.env.SANDBOX_BASE_URL}/itd/portal/public/tans/${req.query.tan}?consent=y&reason=For%20KYC%20of%20the%20organization`, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.SANDBOX_KEY,
                'Authorization': token,
                'x-api-version': process.env.SANDBOX_API_VERSION,
            }
           
        }).then((result) => {
            if (result.status === 200) {
                return res.status(200).json({
                    status: "success",
                    company: result.data
                })
            } else {
                console.log(result)
                return next(ApiError.badRequest(result))
            }
        }).catch((error) => {
            console.log(error)
            if (error.response) {
                if (error.response.status !== 500) {
                    return next(ApiError.badRequest(error.response.data["message"] === undefined ? `Sandbox error ${error}` : error.response.data["message"]))
                }
            }
            return next(ApiError.internalServerError(`Sandbox error ${error}`))
        })
    }


}

module.exports = new TanController();