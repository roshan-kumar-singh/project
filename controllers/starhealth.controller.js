const { StarHealth } = require("../models");
const { Op } = require("sequelize");
const ApiError = require("../errors/ApiError");

class StarHealthController {
  getPlan = async (req, res, next) => {
    // res.send(201).json({
    //   success: true,
    //   data:req.body
    // })
    StarHealth.findOne({
      where: {
        [Op.and]: [
          { plan_type: req.body.plan_type },
          { age_band: req.body.age_band },
        ],
      },
    })
      .then((result) => {
        if (result) {
          return res.status(200).json({
            status: true,
            message: "plan_type",
            data: result,
          });
        } else {
          return next(ApiError.badRequest("failed to get plan"));
        }
      })
      .catch((error) => {
        console.log(`catch block ${error}`);
        if (error) return next(ApiError.conflict(error));
        else return next(ApiError.internalServerError(error));
      });
  };
}

module.exports = new StarHealthController();