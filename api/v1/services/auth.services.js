var commonHelper = require("../helper/common.helper");
const logger = require("../../../config/winston");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
module.exports = {
    /*register*/
    async register(postData) {
        try {
            let user = await db.usersObj.create(postData);
            return user;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    /*getUserByEmail*/
    async getUserByEmail(email) {
        try {
            let user = await db.usersObj.findOne({
                where: { email: email},
                raw: true
            });
            return user;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    /*getAllUsers*/
    async getAllUsers(filters) {
        try {
            const {
                limit,
                offset,
                email = null,
                name = null,
            } = filters;
    
            const whereClause = { [Op.and]: [] };
    
            if (email) {
                whereClause[Op.and].push(
                    where(fn('TRIM', col('email')), {
                        [Op.like]: `%${email.trim()}%`
                    })
                );
            }
    
            if (name) {
                whereClause[Op.and].push(
                    where(fn('TRIM', col('name')), {
                        [Op.like]: `%${name.trim()}%`
                    })
                );
            }
         
            const finalWhere = whereClause[Op.and].length > 0 ? whereClause : {};
    
            const users = await db.usersObj.findAndCountAll({
                where: finalWhere,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                raw: true
            });
    
            return users;
    
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },    
    // /*getUserById*/
    async getUserById(userId) {
        try {
            let users = await db.usersObj.findOne({
                where: { id: userId },
                attributes: {
                    exclude: ['password']
                },
            });
            
            return users;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
     /*userMetaRegister*/
     async userMetaRegister(finalMeta) {
        try {
            let user = await db.userMetaObj.bulkCreate(finalMeta);
            return user;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    /*updateUser*/
    async updateUser(data, userId) {
        try {
            await db.usersObj.update(data, {
                where: { id: userId }
            });
    
            const updatedUser = await db.usersObj.findOne({
                where: { id: userId }
            });
    
            return updatedUser;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    /*findOrCreateGoogleUser*/
    async findOrCreateGoogleUser({ email, name, googleId, profileImage }) {
        try {
            let user = await db.usersObj.findOne({
                where: { email },
            });

            if (user) {
                // Update provider info if not already set
                if (!user.provider || !user.provider_id) {
                    await db.usersObj.update(
                        { provider: 'google', provider_id: googleId, profileImage: profileImage || user.profileImage },
                        { where: { id: user.id } }
                    );
                    user = await db.usersObj.findOne({ where: { id: user.id } });
                }
                return user;
            }

            // Create new user (no password needed for social login)
            user = await db.usersObj.create({
                name,
                email,
                phone: '',
                password: '',
                provider: 'google',
                provider_id: googleId,
                profileImage: profileImage || null,
                role: 'user',
                status: 0,
            });

            return user;
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
     /*deleteUser*/
     async deleteUser(userId) {
        try {
            const deletedCount = await db.usersObj.destroy({
                where: { id: userId }
            });
    
            return {
                deleted: deletedCount > 0,
                message: deletedCount > 0 ? "user deleted" : "user not found"
            };
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
     /*getUserMeta*/
     async getUserMeta(args) {
        try {
            const { userId, metaKey = null } = args;

            if (!userId) throw new Error("userId is required");
            const whereArgs = { userId };
            if (metaKey !== null) whereArgs.metaKey = metaKey;
            

            const getUserMeta = await db.userMetaObj.findAll({
                where: whereArgs
            });
            return getUserMeta;
            
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
    /*updateUserMeta*/
    async updateUserMeta(args) {
        try {
           const {userId, metaData }=  args;

            for (const key in metaData) {
                await db.userMetaObj.upsert({
                    userId,
                    metaKey: key,
                    metaValue: metaData[key]
                });
            }
    
            return await db.userMetaObj.findAll({ where: { userId } });
        } catch (e) {
            logger.errorLog.log("error", commonHelper.customizeCatchMsg(e));
            throw e;
        }
    },
   
}