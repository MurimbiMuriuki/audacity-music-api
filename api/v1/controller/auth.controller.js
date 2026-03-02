const commonHelper = require("../helper/common.helper");
const bcrypt = require("bcryptjs");
const config = require("../../../config/db.config");
const jwt = require("jsonwebtoken");
const authServices = require("../services/auth.services");
const { check, validationResult } = require("express-validator"); // Updated import
const myValidationResult = validationResult.withDefaults({
    formatter: (error) => {
        return error.msg;
    },
});

const { USER_META_KEYS } = require("../helper/constants");


module.exports = {
    /*user register*/
    async register(req, res) {
     
        try {
            
          const errors = myValidationResult(req);
          if (!errors.isEmpty()) {
            return res
              .status(200)
              .send(commonHelper.parseErrorRespose(errors.mapped()));
          }
      
          const data = req.body;
      
          const getUserInfo = await authServices.getUserByEmail(data.email);
          if (getUserInfo) throw new Error("User already exist");
      
          const postData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: bcrypt.hashSync(data.password, 8),
            designation: data.designation,
            role: data.role || null,
            status: data.status || 0,
          };
      
          const createdUser= await authServices.register(postData);
          const metaData = {};

          for (const key in USER_META_KEYS) {
              if (data[key] !== undefined) {
                  metaData[USER_META_KEYS[key]] = data[key];
              }
          }
        await authServices.updateUserMeta({
            userId: createdUser.id,
            metaData
        });

          return res
            .status(200)
            .send(commonHelper.parseSuccessRespose("", "User register successfully"));
      
        } catch (error) {
          return res.status(400).json({
            status: false,
            message: error.response?.data?.error || error.message || "Register failed",
            data: error.response?.data || {}
          });
        }
      },
     /*getAllUser*/
     async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const filters = {
                limit,
                offset,
                name: req.query.name || null,
                email: req.query.email || null,
            };

            let users = await authServices.getAllUsers(filters);            
           
            return res
            .status(200)
            .send(commonHelper.parseSuccessRespose(
                {
                    total: users.count,
                    page,
                    totalPages: Math.ceil(users.count / limit),
                    users: users.rows
                },
                "Users displayed successfully"
            ));
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: error.response?.data?.error || error.message || "User fetch failed",
                data: error.response?.data || {}
            });
        }
    },
     /*getUserById*/
     async getUserById(req, res) {
        try {
            const errors = myValidationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(200)
                    .send(commonHelper.parseErrorRespose(errors.mapped()));
            }
            let userId = req.query.userId;
            const user = await authServices.getUserById(userId);
            if (!user || user.length == 0) throw new Error("Users not found");
            
            return res
                .status(200)
                .send(commonHelper.parseSuccessRespose(user,
                    "Users displayed successfully"));
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: error.response?.data?.error || error.message || "User fetch failed",
                data: error.response?.data || {}
            });
        }

    },

     /*updateUser*/
     async updateUser(req, res) {
        try {
            const errors = myValidationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(200)
                    .send(commonHelper.parseErrorRespose(errors.mapped()));
            }
    
            const { id } = req.params;
            const payload = { ...req.body };
    
            // Hash password if present and valid
            if (payload.password && typeof payload.password === 'string' && payload.password.trim() !== '') {
                const saltRounds = 10;
                payload.password = await bcrypt.hash(payload.password, saltRounds);
            } else {
                delete payload.password; // Prevent empty or invalid password from being saved
            }
    
            const updatedUser = await authServices.updateUser(payload, id);
    
            return res
                .status(200)
                .send(commonHelper.parseSuccessRespose(updatedUser, "User updated successfully"));
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: error.response?.data?.error || error.message || "User update failed",
                data: error.response?.data || {}
            });
        }
    },
    
     /*deleteUser*/
     async deleteUser(req, res) {
        try {
            const errors = myValidationResult(req);
            if (!errors.isEmpty()) {
                return res
                    .status(200)
                    .send(commonHelper.parseErrorRespose(errors.mapped()));
            }
            const { id } = req.params;
   
            const role = await authServices.deleteUser(id)
             
            return res
                .status(200)
                .send(commonHelper.parseSuccessRespose(role,"user delete successfully",));
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: error.response?.data?.error || error.message || "user fetch failed",
                data: error.response?.data || {}
            });
        }
    },


     /*login*/
     async login(req, res) {
        try {
            
            const { email, password } = req.body;
            const getUserInfo = await authServices.getUserByEmail(email);

            if (!getUserInfo) throw new Error("User not found");
            const passwordIsValid = bcrypt.compareSync(password, getUserInfo.password);
            if (!passwordIsValid) throw new Error("Invalid Password!");
            const payload = {
                id: getUserInfo.id,
                name: getUserInfo.name,
                role: getUserInfo.role
            };
            const expiresIn = 60 * 60 * 24 * 30;
            const accessToken = jwt.sign(payload, config.secret, {
                expiresIn: expiresIn,
            });

            const response = {
                access_token: accessToken,
                token_type: "bearer",
                user: {
                  name: getUserInfo.name,
                  email: getUserInfo.email,
                  role: getUserInfo.role,
                },
                expires_in: expiresIn
              };
          
              return res
                .status(200)
                .json(response);
            
        } catch (error) {
            return res.status(400).json({
                status: false,
                message: error.response?.data?.error || error.message || "Login failed",
                data: error.response?.data || {}
            });
        }

    },
  
    validate(method) {
        switch (method) {
            case "register": {
                return [
                    check("email").not().isEmpty().withMessage("Email is Required").isEmail().withMessage("Invalid email format"),
                    check("name").not().isEmpty().withMessage("Name is Required"),
                ];
            }
            case "login": {
                return [
                    check("email").not().isEmpty().withMessage("Email is Required").isEmail().withMessage("Invalid email format"),
                    check("password").not().isEmpty().withMessage("Password is Required")
                ];
            }
            default:
                return [];
        }
    }

}