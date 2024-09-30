import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'
import loginRegisterService from '../service/loginRegisterService'
import { createJWT } from '../middleware/JWTAction'

const getLoginPage = (req, res) => {
    const { serviceURL } = req.query
    return res.render("login.ejs", {
        redirectURL: serviceURL
    })
}

const verifySSOToken = async (req, res) => {
    try {

        // ssoToken từ client gửi lên
        const ssoToken = req.body.ssoToken

        // truy cập req.user thông qua passport
        console.log('>>> verifySSOToken-req.user', req.user)
        if (req.user && req.user.code && req.user.code === ssoToken) {
            const refreshToken = uuidv4()

            // thêm refresh token vào database khi login thành công
            await loginRegisterService.updateUserRefreshToken(req.user.email, refreshToken)

            // tạo access token mới
            const payload = {
                email: req.user.email,
                groupWithRoles: req.user.groupWithRoles,
                username: req.user.username,
            }

            const token = createJWT(payload);

            // set cookies
            res.cookie('refresh_token', refreshToken, {
                maxAge: +process.env.MAX_AGE_ACCESS_TOKEN,
                httpOnly: true
            })

            res.cookie('access_token', token, {
                maxAge: +process.env.MAX_AGE_REFRESH_TOKEN,
                httpOnly: true
            })

            const resData = {
                access_token: token,
                refresh_token: refreshToken,
                groupWithRoles: req.user.groupWithRoles,
                username: req.user.username
            }

            // xoá req.user trong session
            req.session.destroy(function (err) {
                req.logout()
            })

            return res.status(200).json({
                EM: 'Xác minh người dùng thành công!',
                EC: 0,
                DT: resData
            })
        }

        return res.status(200).json({
            EM: 'ssoToken không khớp!',
            EC: 1,
            DT: ''
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            EM: 'Somthing wrongs in service...',
            EC: -1,
            DT: ''
        })
    }

}

module.exports = {
    getLoginPage,
    verifySSOToken
}
