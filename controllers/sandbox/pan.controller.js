const axios = require('axios');
const sandboxUtil = require('../../utils/sandbox.util')
const ApiError = require('../../errors/ApiError')
const fetch = require("node-fetch")
class PanController {
    checkPanAADHARStatus = async (req, res, next) => {
        if (req.query.pan === "" || req.query.aadhar === "" || req.query.aadhar === undefined || req.query.pan === undefined)
            return next(ApiError.badRequest("either query parameter \'aadhar\' or \'pan\' is missing"))


        let token = await sandboxUtil.getSandboxAuthToken();
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: token,
                'x-api-key': process.env.SANDBOX_KEY,
                'x-api-version': process.env.SANDBOX_API_VERSION
            }
        };

        fetch(`${process.env.SANDBOX_BASE_URL}/pans/${req.query.pan}/pan-aadhaar-status?aadhaar_number=${req.query.aadhar}`, options)
            .then(response => response.json())
            .then(response => res.status(200).json(response))
            .catch(err => {
                console.log("catch eeror:", err.response)
                if (err.response) {
                    if (err.response.status !== 500) {
                        return next(ApiError.internalServerError(err.response.data["message"] === undefined ? `Sandbox error ${err}` : err.response.data["message"]))
                    }
                }
                return next(ApiError.internalServerError(`Sandbox error ${err}`))
            });


        // let token = await sandboxUtil.getSandboxAuthToken()
        // await axios.get(`${process.env.SANDBOX_BASE_URL}/pans/${req.query.pan}/pan-aadhaar-status`, {
        //     headers: {
        //         'x-api-key': process.env.SANDBOX_KEY,
        //         'Authorization': token,
        //         'x-api-version': process.env.SANDBOX_API_VERSION,
        //     },
        //     params:{
        //         aadhaar_number:req.query.aadhar
        //     }
        // }).then((result) => {
        //     if (result.status === 200) {
        //         return res.status(200).json({
        //             status: "success",
        //             company: result.data["data"]["message"]
        //         })
        //     } else {
        //         console.log(result)
        //         return next(ApiError.badRequest(result))
        //     }
        // }).catch((error) => {
        //     console.log(error)
        //     if (error.response) {
        //         if (error.response.status !== 500) {
        //             return next(ApiError.badRequest(error.response.data["message"] === undefined ? `Sandbox error ${error}` : error.response.data["message"]))
        //         }
        //     }
        //     return next(ApiError.internalServerError(`Sandbox error ${error}`))
        // })
    }

    getAdvancePanDetails = async (req, res, next) => {
        if (req.query.pan === "" || req.query.pan === undefined)
            return next(ApiError.badRequest("query parameter \'pan\' is missing"))


            let token = await sandboxUtil.getSandboxAuthToken();
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    Authorization: token,
                    'x-api-key': process.env.SANDBOX_KEY,
                    'x-api-version': process.env.SANDBOX_API_VERSION
                },
                body: JSON.stringify({pan:`${req.query.pan}`, consent: 'Y', reason: 'For KYC of User'})
            };
    
            fetch(`${process.env.SANDBOX_BASE_URL}/kyc/pan`, options)
                .then(response => response.json())
                .then(response => res.status(200).json(response))
                .catch(err => {
                    console.log("catch eeror:", err.response)
                    if (err.response) {
                        if (err.response.status !== 500) {
                            return next(ApiError.internalServerError(err.response.data["message"] === undefined ? `Sandbox error ${err}` : err.response.data["message"]))
                        }
                    }
                    return next(ApiError.internalServerError(`Sandbox error ${err}`))
                });

        // let token = await sandboxUtil.getSandboxAuthToken()
        // await axios.get(`${process.env.SANDBOX_BASE_URL}/kyc/pans/${req.query.pan.toUpperCase()}?consent=Y&reason=For KYC of User`, {
        //     headers: {
        //         'x-api-key': process.env.SANDBOX_KEY,
        //         'Authorization': token,
        //         'x-api-version': process.env.SANDBOX_API_VERSION,
        //     }
        // }).then((result) => {
        //     if (result.status === 200) {
        //         return res.status(200).json({
        //             status: "success",
        //             company: result.data["data"]
        //         })
        //     } else {
        //         console.log(result)
        //         return next(ApiError.badRequest(result.data["message"]))
        //     }
        // }).catch((error) => {
        //     console.log(error)
        //     if (error.response) {
        //         if (error.response.status !== 500) {
        //             return next(ApiError.badRequest(error.response.data["message"] === undefined ? `Sandbox error ${error}` : error.response.data["message"]))
        //         }
        //     }
        //     return next(ApiError.internalServerError(`Sandbox error ${error}`))
        // })

    }
}

module.exports = new PanController();