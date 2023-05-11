const { User, OTP, UserProfile, UserBusinessProfile } = require('../models');
const bCrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const ApiError = require('../errors/ApiError');

var nodemailer = require('nodemailer');

function wrapedSendMail(transporter, mailOptions){
    return new Promise((resolve, reject)=>{
        transporter.sendMail(mailOptions, function(error, result){
            if (error) {
                console.log("error is "+error);
                resolve({ success: false, error });
            } 
            else {
                resolve({ success: true, result });
            }
        });
   });
}

// To add minutes to the current time
function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

class UserController {
    create = async (req, res, next) => {
        console.log(req.body);
        if (req.body.email === undefined) {
            return next(ApiError.badRequest("please enter email address"));
        }

        if (req.body.password === undefined) {
            return next(ApiError.badRequest("please enter password"));
        }

        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email) !== true) {
            next(ApiError.badRequest("please enter valid email"))
            return;
        }

        let isUsernameExists = await isUsernameExist(req.body.email)
        let isPhoneExists = await isPhoneExist(req.body.phone)
        if (isUsernameExists) {
            next(ApiError.conflict("email already exists"))
            return;
        }
        if (isPhoneExists) {
            next(ApiError.conflict("phone already exists"))
            return;
        }

        bCrypt.hash(req.body.password, bCrypt.genSaltSync(8), null, (err, hash) => {
            if (err) {
                console.log(`bcrypt error ${err}`)
                return next(ApiError.internalServerError(err.toString()))
            } else {
                console.log("trying creating user")
                User.create({
                    // id: uuid.v4(),
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    phone: req.body.phone,
                    email: req.body.email,
                    password: hash,
                    pincode: req.body.pincode,
                    dob: req.body.dob ?? '',
                    gender: req.body.gender ?? '',
                    // profileImage: req.body.profileImage,
                    // notificationToken: req.body.notificationToken,
                    // userType: req.body.userType,
                    social_id: req.body.socialID,
                    // loginVia: req.body.loginVia,
                    // created_at: Date.now()
                }).then((result) => {
                    console.log(result)
                    if (result) {
                        const token = getJwtToken(result)
                        return res.status(200).json({
                            status: true,

                           
                            results: {
                                status: 200,
                                message: "Registration Successfull",
                                data: {

                                    id: result['dataValues']['id'],
                                    email: result['dataValues']['email'],
                                    first_name: result['dataValues']['first_name'],
                                    last_name: result['dataValues']['last_name'],
                                    phone: result['dataValues']['phone'],
                                    pincode: result['dataValues']['pincode'],
                                    profileImage: result['dataValues']['profileImage'],
                                
                                },
                                token: token,
                            }
                        })
                    } else {
                        return next(ApiError.badRequest("failed to create user"))
                    }
                }).catch((error) => {
                    console.log(`catch block ${error}`)
                    if (error)
                        return next(ApiError.conflict(error));
                    else
                        return next(ApiError.internalServerError(error))
                });
            }
        })

    }

    async verifyEmail(req, res, next) {
        try {
            var currentdate = new Date(); 
            const {verification_key, otp, email} = req.body;
            
            if(!verification_key){
                const response={"status":"Failure","message":"Verification Key not provided"}
                return res.status(400).send(response) 
            }
            if(!otp){
                const response={"status":"Failure","message":"OTP not Provided"}
                return res.status(400).send(response) 
            }
            if(!email){
                const response={"status":"Failure","message":"Check not Provided"}
                return res.status(400).send(response) 
            }
            // Find the OTP instance in DB
            const otp_instance = await OTP.findOne({
                where: {
                    id: verification_key
                }
            });
        if(otp_instance!=null){
          // Check if the OTP is expired
          if(otp_instance.expiration_time<currentdate){
            const response={"status":"Failure","message":"OTP Expired"}
            return res.status(400).send(response) 
          }
          // Check if the OTP is correct
          if(otp_instance.otp!=otp){
            const response={"status":"Failure","message":"Incorrect OTP"}
            return res.status(400).send(response) 
          }
          // Check if the email is correct
        
          // Delete the OTP instance from DB
          await OTP.destroy({
            where: {
              id: verification_key
            }
          });

          const result = await User.findOne({
                where: {
                    email: {
                        [Op.eq]: email,
                    }
                }
            });

          if (result) {
            const token = getJwtToken(result)
            return res.status(200).json({
                status: true,

               
                results: {
                    status: 200,
                    message: "Login Successfull",
                    data: {
                        id: result['dataValues']['id'],
                        email: result['dataValues']['email'],
                        first_name: result['dataValues']['first_name'],
                        last_name: result['dataValues']['last_name'],
                        phone: result['dataValues']['phone'],
                        pincode: result['dataValues']['pincode'],
                        gender: result['dataValues']['gender'],
                        dob: result['dataValues']['dob'],
                        profileImage: result['dataValues']['profileImage'],
                        userType: result['dataValues']['userType'],
                    },
                    token: token,
                }
            })
        } else {
            return next(ApiError.badRequest("failed to get user"))
        }
        }else{
          const response={"status":"failure","message":"Incorrect Verification Key"}
          return res.status(400).send(response) 
        }
           
          } catch (err) {
            const response={"status":"failure","message": err.message}
            return res.status(400).send(response)
          }
    }

    loginWithEmail = async (req, res, next) => {
        const { email } = req.body;

        User.findOne({
            where: {
                email: {
                    [Op.eq]: email,
                }
            }
        }).then((result) => {
            if (result) {
                bCrypt.compare(req.body.password, result['dataValues']['password'], async (err, hashResult) => {
                    if (err) {
                        return next(ApiError.internalServerError("something went wrong"))
                    }

                    if (hashResult) {
                        const isAdmin = email === 'admin@itaxeasy.com';
                        const isDev = email === 'dev@itaxeasy.com';

                        const otp = isDev ? 777888 : Math.floor(Math.random()*899999+100000).toString();
                        const now = new Date();
                        const expiration_time = AddMinutesToDate(now,10);
                        //Create OTP instance in DB
                        const otp_instance = await OTP.create({
                            otp: otp,
                            expiration_time: expiration_time
                        });

                        const email_subject = "OTP: For Email Verification";
                        const email_message = `Dear User, \n\n` 
                        + 'OTP for your email verification is : \n\n'
                        + `${otp}\n\n`
                        + 'This is a auto-generated email. Please do not reply to this email.\n\n'
                        + 'Regards\n'
                        + 'Itaxeasy\n\n';

                        // Create details object containing the email and otp id
                        var details={
                            "timestamp": now, 
                            "check": email,
                            "success": true,
                            "message":"OTP sent to user",
                            "otp_id": otp_instance.id
                        };

                        if(isDev) {
                            return res.send({"status":"Success","data": details});
                        } else {
                            var transporter = nodemailer.createTransport({
                                // service: 'cruxtech.in',
                                host:'mail.itaxeasy.com',
                                port:465,
                                // secure:false,
                                auth: {
                                    user: 'support@itaxeasy.com',
                                    pass: process.env.EMAIL_PASSWORD
                                },
                                tls: {
                                    // do not fail on invalid certs
                                    rejectUnauthorized: false
                                },
                            });


                            const mailOptions = {
                                from: `support@itaxeasy.com`,
                                to: `${isAdmin ? 'mukulbedi@yahoo.com' : email}`,
                                subject: email_subject,
                                text: email_message ,
                            };
                            
                            await transporter.verify();

                            const { success, error, result } = await wrapedSendMail(transporter, mailOptions);

                            if (!success) {
                                return next(ApiError.internalServerError("something went wrong"));
                            }

                            return res.send({"status":"Success","data": details});
                        }
                    }

                    return next(ApiError.unAuthorized("invalid credentials"))
                });
            } else {
                return next(ApiError.notFound("user does not exists"))
            }
        }).catch((error) => {
            if (error)
                return next(ApiError.badRequest(error));
            else
                return next(ApiError.internalServerError("something went wrong"))
        });

        
    }

    login = async (req, res, next) => {
        User.findOne({
            where: {
                [Op.or]: [{
                    email: req.body.email,
                },
                {
                    phone: req.body.email,
                }
                ]

            }
        }).then((result) => {
            if (result) {
                bCrypt.compare(req.body.password, result['dataValues']['password'], (err, hashResult) => {
                    if (err) {
                        return next(ApiError.internalServerError("something went wrong"))
                    }

                    if (hashResult) {
                        const token = getJwtToken(result)
                        return res.status(200).json({
                            status: true,
                         
                            results: {
                                status: 200,
                                message: "login successfull",
                                data: {
                                    id: result['dataValues']['id'],
                                    email: result['dataValues']['email'],
                                    first_name: result['dataValues']['first_name'],
                                    last_name: result['dataValues']['last_name'],
                                    userType: result['dataValues']['userType'],
                                    phone: result['dataValues']['phone'],
                                    pincode: result['dataValues']['pincode'],
                                    isverified: result['dataValues']['isverified'],

                                },
                                token: token,

                            }

                        })

                    }
                    return next(ApiError.unAuthorized("invalid credentials"))
                })
            } else {
                return next(ApiError.notFound("user does not exists"))
            }
        }).catch((error) => {
            if (error)
                return next(ApiError.badRequest(error));
            else
                return next(ApiError.internalServerError("something went wrong"))
        });

    }
    logInWithOtp = async (req, res, next) => {
        var token = req.header('authorization');
        if (token) {
            var payload = decodeToken(token);
            User.findOne({
                where: {
                    phone: payload.phone
                }
            }).then((result) => {
                if(result){
                    const token = getJwtToken(result)
                    return res.status(200).json({
                        status: true,
                     
                        results: {
                            status: 200,
                            message: "login successfull",
                            data: {
                                id: result['dataValues']['id'],
                                email: result['dataValues']['email'],
                                first_name: result['dataValues']['first_name'],
                                last_name: result['dataValues']['last_name'],
                                phone: result['dataValues']['phone'],
                                pincode: result['dataValues']['pincode'],
                                isverified: result['dataValues']['isverified']
                            },
                            token: token,

                        }});
                }else{
                    return next(ApiError.notFound("user does not exists"));
                }

            });                
        }
        else{
            return next(ApiError.unAuthorized("invalid credentials"))
        }
    }
    updateUser = async (req, res, next) => {
        var token = req.header('authorization')
        if (token) {
            var payload = decodeToken(token)
            User.findOne({
                where: {
                    id: payload.id
                }
            })
                .then((user) => {
                    user.update({
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        email:req.body.email,
                        phone: req.body.phone,
                        pincode: req.body.pincode,
                        isverified: req.body.isverified,
                    }).then((result) => {

                        if (result) {
                            return res.status(200).json({
                                status: "success",
                                message: "profile updated successfully",
                                // result: result
                            })
                        } else {
                            return next(ApiError.badRequest("failed to create user"))
                        }
                    }).catch((error) => {
                        console.log(`catch block ${error}`)
                        if (error)
                            return next(ApiError.conflict(error));
                        else
                            return next(ApiError.internalServerError(error))
                    });
                })

        } else {
            return next(ApiError.unAuthorized("invalid credentials"))
        }


    }
    updatePassword = async (req, res, next) => {
        var token = req.header('authorization');
        var currentdate = new Date(); 
        if (token) {
            var payload = decodeToken(token);
            if(payload.expiration_time<currentdate){
                return next(ApiError.unAuthorized("token expired"))
            }
       const   user=  User.findOne({
                where: {
                    id: payload.id
                }
            });
            if(!user){
                return next(ApiError.notFound("user does not exists"))

            }

        bCrypt.hash(req.body.password, bCrypt.genSaltSync(8), null, (err, hash) => {
            if (err) {
                console.log(`bcrypt error ${err}`)
                return next(ApiError.internalServerError(err.toString()))
            } else {
                User.update(
                    { password: hash },
                    { where: {id: payload.id } }
                )
                    .then((result) => {
                        if (result[0]) {
                            return res.status(200).json({
                                status: "success",
                                message: "password updated successfully",
                              
                            })
                        } else {
                            return next(ApiError.badRequest("user not found"))
                        }
                    }).catch((error) => {
                        console.log(`catch block ${error}`)
                        if (error)
                            return next(ApiError.conflict(error));
                        else
                            return next(ApiError.internalServerError(error))
                    });

            }
        })
    }
    else{
        return next(ApiError.unAuthorized("invalid credentials"))
    }
    }


    createProfile = async (req, res, next) => {
        var token = req.header('authorization')
        var payload = decodeToken(token)
        UserProfile.create({
            user_id: payload.id,
            pan: req.body.pan,
            aadhar: req.body.aadhar,
            profile_img: req.body.profile_img,
        }).then((result) => {
            if (result) {
                return res.status(201).json({
                    status: "created",
                    message: "user created successfully",
                })
            } else {
                return next(ApiError.badRequest("failed to create user"))
            }
        }).catch((error) => {
            console.log(`catch block ${error}`)
            if (error)
                return next(ApiError.conflict(error));
            else
                return next(ApiError.internalServerError(error))
        });

    }
    updateProfile = async (req, res, next) => {
        var token = req.header('authorization')
        if (token) {
            var payload = decodeToken(token)
            UserProfile.findOne({
                where: {
                    user_id: payload.id
                }
            })
                .then((userprofile) => {
                    if(!userprofile) {
                        return this.createProfile(req, res, next);
                    }

                    userprofile.update({
                        pan: req.body.pan,
                        aadhar: req.body.aadhar,
                        profile_img: req.body.profile_img,
                    }).then((result) => {

                        if (result) {
                            return res.status(200).json({
                                status: "success",
                                message: "profile updated successfully",
                                result: result
                            })
                        } else {
                            return next(ApiError.badRequest("failed to create user"))
                        }
                    }).catch((error) => {
                        console.log(`catch block ${error}`)
                        if (error)
                            return next(ApiError.conflict(error));
                        else
                            return next(ApiError.internalServerError(error))
                    });
                })

        } else {
            return next(ApiError.unAuthorized("invalid credentials"))
        }


    }

    getProfile = async (req, res, next) => {
        var token = req.header('authorization')
        var payload = decodeToken(token)
        UserProfile.findOne({
            include: [{
                model: User,
                where: { id: payload.id }
            }]
        }).then((result) => {
            console.log(result["dataValues"].User["dataValues"]);
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "user profile",
                    data: {
                        id: result['dataValues']['id'],
                        user_id: result['dataValues']['user_id'],
                        pan: result['dataValues']['pan'],
                        aadhar: result['dataValues']['aadhar'],
                        profile_img: result['dataValues']['profile_img'],
                        first_name: result['dataValues'].User['dataValues']['first_name'],
                        last_name: result['dataValues'].User['dataValues']['last_name'],
                        phone: result['dataValues'].User['dataValues']['phone'],
                        email: result['dataValues'].User['dataValues']['email'],
                        pincode: result['dataValues'].User['dataValues']['pincode'],
                        isverified: result['dataValues'].User['dataValues']['isverified'],

                    }
                })
            } else {
                return next(ApiError.badRequest("failed to get user"))
            }
        }).catch((error) => {
            console.log(`catch block ${error}`)
            if (error)
                return next(ApiError.conflict(error));
            else
                return next(ApiError.internalServerError(error))
        });
    }
    //business profile
    createBusinessProfile = async (req, res, next) => {
        var token = req.header('authorization')
        var payload = decodeToken(token)
        UserBusinessProfile.create({
             user_id: req.body.user_id,
             businessName:req.body.businessName,
             bankAccountNo:req.body.bankAccountNo,
             companyPanNo:req.body.companyPanNo,
             companyTanNo:req.body.companyTanNo,
             msmeNo:req.body.msmeNo,
             gstNo:req.body.gstNo,
             bandDetails:req.body.bankDetails,
             incorporateCertificate:req.body.incorporateCertificate,
             

                    // ifsc: req.body.ifsc,
                    // contactNo: req.body.contactNo,
                    // accountHolderName: req.body.accountHolderName,
                    // accountNo: req.body.accountNo
                }).then((result) => {
                    if (result) {
                        return res.status(201).json({
                            status: true,
                            message: "Business Profile created successfully",
                        })
                    } else {
                        return next(ApiError.badRequest("failed to create user"))
                    }
                })
            }

    updateBusinessProfile = async (req, res, next) => {
        var token = req.header('authorization')
        if (token) {
            var payload = decodeToken(token)
            UserBusinessProfile.findOne({
                where: {
                    user_id: payload.id
                }
            })
                .then((businesprofile) => {
                    if(businesprofile!=null){
                    businesprofile.update({
                        businessName:req.body.businessName,
                        bankAccountNo:req.body.bankAccountNo,
                        companyPanNo:req.body.companyPanNo,
                        companyTanNo:req.body.companyTanNo,
                        msmeNo:req.body.msmeNo,
                        gstNo:req.body.gstNo,
                        bandDetails:req.body.bandDetails,
                        incorporateCertificate:req.body.incorporateCertificate,
                        
                    


                        // ifsc: req.body.ifsc,
                        // contactNo: req.body.contactNo,
                        // accountHolderName: req.body.accountHolderName,
                        // accountNo: req.body.accountNo
                    }).then((result) => {


                        if (result) {
                            return res.status(200).json({
                                status: "success",
                                message: "profile updated successfully",
                                result: result
                            })
                        } else {
                            return next(ApiError.badRequest("failed to update user"))
                        }
                    }).catch((error) => {
                        console.log(`catch block ${error}`)
                        if (error)
                            return next(ApiError.conflict(error));
                        else
                            return next(ApiError.internalServerError(error))
                    });
                }
            });
        } else {
            return next(ApiError.unAuthorized("invalid credentials"))
        }


    }

    createOrUpdateBusinessProfile = async (req, res, next) => {
        var token = req.header('authorization')
        if (token) {
            var payload = decodeToken(token)
            UserBusinessProfile.findOne({
                where: {
                    user_id: payload.id
                }
            })
                .then((businesprofile) => {
                    if(businesprofile!=null){
                    businesprofile.update({
                        businessName:req.body.businessName,
                        bankAccountNo:req.body.bankAccountNo,
                        companyPanNo:req.body.companyPanNo,
                        companyTanNo:req.body.companyTanNo,
                        msmeNo:req.body.msmeNo,
                        gstNo:req.body.gstNo,
                        bandDetails:req.body.bandDetails,
                        incorporateCertificate:req.body.incorporateCertificate,
                        
                    


                        // ifsc: req.body.ifsc,
                        // contactNo: req.body.contactNo,
                        // accountHolderName: req.body.accountHolderName,
                        // accountNo: req.body.accountNo
                    }).then((result) => {


                        if (result) {
                            return res.status(200).json({
                                status: "success",
                                message: "profile updated successfully",
                                result: result
                            })
                        } else {
                            return next(ApiError.badRequest("failed to update user"))
                        }
                    }).catch((error) => {
                        console.log(`catch block ${error}`)
                        if (error)
                            return next(ApiError.conflict(error));
                        else
                            return next(ApiError.internalServerError(error))
                    });
                }else{

                    UserBusinessProfile.create({
                        user_id: payload.id,
                        businessName:req.body.businessName,
                        bankAccountNo:req.body.bankAccountNo,
                        companyPanNo:req.body.companyPanNo,
                        companyTanNo:req.body.companyTanNo,
                        msmeNo:req.body.msmeNo,
                        gstNo:req.body.gstNo,
                        bandDetails:req.body.bankDetails,
                        incorporateCertificate:req.body.incorporateCertificate,
                        
           
                               // ifsc: req.body.ifsc,
                               // contactNo: req.body.contactNo,
                               // accountHolderName: req.body.accountHolderName,
                               // accountNo: req.body.accountNo
                           }).then((result) => {
                               if (result) {
                                   return res.status(201).json({
                                       status: true,
                                       message: "Business Profile created successfully",
                                   })
                               } else {
                                   return next(ApiError.badRequest("failed to create user"))
                               }
                            });


                }
            });
        } else {
            return next(ApiError.unAuthorized("invalid credentials"))
        }


    }


    deleteBusinessProfile = async (req, res, next) => {
        var token = req.header('authorization')
        if (token) {
            var payload = decodeToken(token)
            UserBusinessProfile.findOne({
                where: {
                    user_id: payload.id
                }
            })
                .then((businesprofile) => {
                    businesprofile.destroy({
                        
           


                        // ifsc: req.body.ifsc,
                        // contactNo: req.body.contactNo,
                        // accountHolderName: req.body.accountHolderName,
                        // accountNo: req.body.accountNo
                    }).then((result) => {

                        if (result) {
                            return res.status(200).json({
                                status: "success",
                                message: "profile delete successfully",
                                result: result
                            })
                        } else {
                            return next(ApiError.badRequest("failed to delete user"))
                        }
                    }).catch((error) => {
                        console.log(`catch block ${error}`)
                        if (error)
                            return next(ApiError.conflict(error));
                        else
                            return next(ApiError.internalServerError(error))
                    });
                })

        } else {
            return next(ApiError.unAuthorized("invalid credentials"))
        }


    }
sendOtpToMobile=async(req,res,next)=>{
    let isPhoneExists = await isPhoneExist(req.body.phone)
        if (!isPhoneExists) {
            next(ApiError.conflict("Account not found"));
            return;
        }else{
            try {
                var otp = Math.floor(100000 + Math.random() * 900000);
            var message = "Your OTP is " + otp;
           const otpToken= jwt.sign({
                otp: otp,
                phone: req.body.phone
            }, process.env.JWT_KEY, {
                issuer: "iTaxEasy",
                expiresIn: "1Y"
            });
            res.status(200).json({
                status: true,
                message: "OTP sent successfully.Verify your mobile number using OTP and token",
                otpToken: otpToken,
                otp: otp,
                phone: req.body.phone
            });
            } catch (error) {
                console.log(error)
                return next(ApiError.internalServerError(error));
                
            }


        }
}


getallUsers = async (req, res, next) => {

        User.findAndCountAll({
            limit: 10,
            offset: req.query.page*10,
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'pincode', 'isverified', 'createdAt', 'updatedAt','userType'  ],
            where: {},
        }).then((result) => {
            if (result) {
                const response = getPagingData(result, req.query.page, 10);
               return res.send(response);
            } else {

                return next(ApiError.badRequest("failed to get user"))
            }
        }).catch((error) => {
            console.log(`catch block ${error}`)
            if (error)


                return next(ApiError.conflict(error));
            else
                return next(ApiError.internalServerError(error))
        });
    }


    getBusinessProfile = async (req, res, next) => {
        var token = req.header('authorization')
        var payload = decodeToken(token)
        UserBusinessProfile.findOne({
            include: [{
                model: User,
                where: { id: payload.id }
            }]
        }).then((result) => {
            if (result) {
                return res.status(200).json({
                    status: "success",
                    message: "user profile",
                    data: result
                })
            } else {
                return next(ApiError.badRequest("failed to get user"))
            }
        }).catch((error) => {
            console.log(`catch block ${error}`)
            if (error)
                return next(ApiError.conflict(error));
            else
                return next(ApiError.internalServerError(error))
        });
    }
}

isUsernameExist = async (email) => {
    return await User.findOne({
        where: {
            email: email
        }
    })
}
isPhoneExist = async (phone) => {
    return await User.findOne({
        where: {
            phone: phone
        }
    })
}
decodeToken = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buff = new Buffer(base64, 'base64');
    const payloadinit = buff.toString('ascii');
    const payload = JSON.parse(payloadinit);
    return payload;
}
getJwtToken = (user) => {
    return jwt.sign({
        id: user['dataValues']['id'],
        email: user['dataValues']['email'],
        first_name: user['dataValues']['first_name'],
        last_name: user['dataValues']['last_name'],
        phone: user['dataValues']['phone'],
        pincode: user['dataValues']['pincode'],
        userType: user['dataValues']['userType'],
        environment: process.env.NODE_ENV
    }, process.env.JWT_KEY, {
        issuer: "iTaxEasy",
        expiresIn: "1Y"
    })
}
const getPagingData = (result, page, limit) => {
    const { count: totalItems, rows: data } = result;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
  
    return { totalItems, data, totalPages, currentPage };
  };

module.exports = new UserController();