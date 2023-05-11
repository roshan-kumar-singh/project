const axios = require('axios');
const sandboxUtil = require('../../utils/sandbox.util')
const ApiError = require('../../errors/ApiError')
const fetch = require("node-fetch")
class TdsController {
    //TDS
 prepareTdsReturn = async (req, res, next) => {
       

        let token = await sandboxUtil.getSandboxAuthToken();
        console.log(token);
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: token,
                'x-api-key': process.env.SANDBOX_KEY,
                'x-api-version': process.env.SANDBOX_API_VERSION
            },
            data:req.body.payload
        };
        await fetch(`${process.env.SANDBOX_BASE_URL}/tds-reporting/deductors/${req.query.tan}/tdsrs/${req.query.from}/async?financial_year=${req.query.financial_year}&quarter=${req.query.quater}&previous_rrr_number=${req.query.privious_recipt}&filing_type=${req.query.filing_type}`, options)
           
            

        .then((result) => {
            if (result.status === 200) {
                return res.status(200).json({
                    status: "success",
                    company: result.company
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

    tdsReturnStatus =async(req,res,next)=>{

        let token = await sandboxUtil.getSandboxAuthToken()
        console.log(token);
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                Authorization: token,
                'x-api-key': process.env.SANDBOX_KEY,
                'x-api-version': process.env.SANDBOX_API_VERSION
            }
        };
       // fetch(`${process.env.SANDBOX_BASE_URL}/tds-reporting/deductors/${req.query.tan}/tdsrs/${req.query.from_quarter}/async?job_id=${req.query.job_id}&financial_year={req.bod.financial_year}&quarter={req.query.quarter}`, options)
             fetch(`${process.env.SANDBOX_BASE_URL}/tds-reporting/deductors/${req.query.tan}/tdsrs/${req.query.from_quarter}/async`, options) 
            

        .then((result) => {
            if (result.status === 200) {
                return res.status(200).json({
                    status: "success",
                    company: result
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

tdsCalculator =async (req, res, next) => {
    
    let token = await sandboxUtil.getSandboxAuthToken()
    console.log(token);
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: token,
            'x-api-key': process.env.SANDBOX_KEY,
            'x-api-version': process.env.SANDBOX_API_VERSION
        },
        data:req.body.payload,
        body: JSON.stringify({
            deductee_type: 'Individual',
            is_pan_available: 'n',
            residential_status: 'Non Resident',
            nature_of_payment: 'Cargo Handling Services Inspection And Logistics Services',
            credit_amount: 1500000,
            credit_date: '29/04/2022'
          })
         
    };
fetch(`${process.env.SANDBOX_BASE_URL}/calculators/tds`, options)
        .then((result) => {
        if (result.status === 200) {
            return res.status(200).json({
                status: "success",
                company: result
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


section206ABAnd206CCACheck = async (req, res, next) => {
    
  let token = await sandboxUtil.getSandboxAuthToken()
  console.log(token);
  const options = {
      method: 'GET',
      headers: {
          accept: 'application/json',
          Authorization: token,
          'x-api-key': process.env.SANDBOX_KEY,
          'x-api-version': process.env.SANDBOX_API_VERSION
      },
      //body: JSON.stringify({pan:`${req.query.pan}`, consent: 'Y', reason: 'For KYC of User'})
  };
  fetch(`${process.env.SANDBOX_BASE_URL}/itd/reporting-portal/tds/206-ab/${req.query.pan}`, options)
      .then((result) => {
        console.log(result.data);
      if (result.status === 200) {
        console.log(req);
          return res.status(200).json({
              status: "success",
              company: result
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



     section206ABAsyncAPI = async (req, res, next) => {
      let token = await sandboxUtil.getSandboxAuthToken()
      console.log(token);
      const options = {
          method: 'POST',
          headers: {
              accept: 'application/json',
              Authorization: token,
              'x-api-key': process.env.SANDBOX_KEY,
              'x-api-version': process.env.SANDBOX_API_VERSION
          },
          data:req.body.payload
      };
      fetch(`${process.env.SANDBOX_BASE_URL}/itd/reporting-portal/tds/206-ab`, options)
          .then((result) => {
          if (result.status === 200) {
              return res.status(200).json({
                  status: "success",
                  company: result
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

      
      section206ABStatus = async (req, res, next) => {
        let token = await sandboxUtil.getSandboxAuthToken()
        console.log(token);
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: token,
                'x-api-key': process.env.SANDBOX_KEY,
                'x-api-version': process.env.SANDBOX_API_VERSION
            },
            data:req.body.payload
        };
        fetch(`${process.env.SANDBOX_BASE_URL}/itd/reporting-portal/tds/206-ab`, options)
            .then((result) => {
            if (result.status === 200) {
                return res.status(200).json({
                    status: "success",
                    company: result
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

      authenticateTracesSession = async (req, res, next) => {

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

       downloadForm16A = async (req, res, next) => {
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

      };
      
      downloadForm16 = async (req, res, next) => {
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
      };

}


module.exports = new TdsController();