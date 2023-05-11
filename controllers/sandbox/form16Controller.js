const axios = require('axios');
const sandboxUtil = require('../../utils/sandbox.util')
const ApiError = require('../../errors/ApiError')
const fetch = require("node-fetch")
class Form16 {
    genrateTraceSession = async (req, res, next) => {
      
            let token = await sandboxUtil.getSandboxAuthToken();
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    Authorization: token,
                    'x-api-key': process.env.SANDBOX_KEY,
                    'x-api-version': process.env.SANDBOX_API_VERSION
                },
                body: JSON.stringify({
                    raw_body: req.body.payload
                })
            };
    
            fetch(`${process.env.SANDBOX_BASE_URL}/tds-compliance/traces/authenticate`, options)
                .then(response => response.json())
                .then(response => res.status(200).json(response))
                .catch(error => {
                    console.log("catch eeror:", error.response)
                    if (error.response) {
                        if (error.response.status !== 500) {
                            return next(ApiError.internalServerError(error.response.data["message"] === undefined ? `Sandbox error ${error}` : error.response.data["message"]))
                        }
                    }
                    return next(ApiError.internalServerError(`Sandbox error ${error}`))
                });

    }

    download16A =async(req, res, next) => {

        let token = await sandboxUtil.getSandboxAuthToken();
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: token,
                'x-api-key': process.env.SANDBOX_KEY,
                'x-api-version': process.env.SANDBOX_API_VERSION
            },
            body: JSON.stringify({
                raw_body: req.body.payload
            })
        };

        fetch(`${process.env.SANDBOX_BASE_URL}/tds-compliance/traces/deductors/${req.query.tan}/form-16a?quarter=${req.query.quarter}&financial_year=${req.query.financial_year}`, options)
            .then(response => response.json())
            .then(response => res.status(200).json(response))
            .catch(error => {
                console.log("catch eeror:", error.response)
                if (error.response) {
                    if (error.response.status !== 500) {
                        return next(ApiError.internalServerError(error.response.data["message"] === undefined ? `Sandbox error ${error}` : error.response.data["message"]))
                    }
                }
                return next(ApiError.internalServerError(`Sandbox error ${error}`))
            });


    }

    downloadForm16 =async(req, res, next) => {

        let token = await sandboxUtil.getSandboxAuthToken();
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: token,
                'x-api-key': process.env.SANDBOX_KEY,
                'x-api-version': process.env.SANDBOX_API_VERSION
            },
            body: JSON.stringify({
                raw_body: req.body.payload
            })
        };

        fetch(`${process.env.SANDBOX_BASE_URL}/tds-compliance/traces/deductors/{req.query.tan}/form-16?quarter=${req.query.quarter}&financial_year=${req.query.financial_year}`, options)
            .then(response => response.json())
            .then(response => res.status(200).json(response))
            .catch(error => {
                console.log("catch eeror:", error.response)
                if (error.response) {
                    if (error.response.status !== 500) {
                        return next(ApiError.internalServerError(error.response.data["message"] === undefined ? `Sandbox error ${error}` : error.response.data["message"]))
                    }
                }
                return next(ApiError.internalServerError(`Sandbox error ${error}`))
            });
    }


}

module.exports = new Form16();