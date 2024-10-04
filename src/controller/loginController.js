import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'
import loginRegisterService from '../service/loginRegisterService'
import { createJWT } from '../middleware/JWTAction'
import nodemailer from "nodemailer";
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';


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
                username: req.user.username,
                email: req.user.email
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

const getResetPasswordPage = (req, res) => {
    return res.render('forgot-password.ejs')
}

const sendCode = async (req, res) => {

    const checkEmailLocal = await loginRegisterService.isEmailLocal(req.body.email)

    if (!checkEmailLocal) {
        return res.json({
            message: 'Địa chỉ Email không tồn tại'
        })
    }

    const OTP = Math.floor(100000 + Math.random() * 900000)
    const filePath = path.join(__dirname, '../templates/reset-password.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);

    const replacements = {
        email: process.env.GOOGLE_APP_EMAIL,
        otp: OTP
    };

    const htmlToSend = template(replacements);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GOOGLE_APP_EMAIL,
            pass: process.env.GOOGLE_APP_PASSWORD,
        },
    });

    try {
        
        await transporter.sendMail({
            from: `phohoccode <${process.env.GOOGLE_APP_EMAIL}>`,
            to: `${req.body.email}`,
            subject: "Đặt lại mật khẩu",
            text: "phohoccode",
            html: htmlToSend
        });

        // cập nhật mã code vào database
       await loginRegisterService.updateUserCode(OTP, req.body.email)
        
       return res.json({
            message: 'Đã gữi mã xác nhận đến email của bạn!'
       })

    } catch (error) {
        console.log(error);
    }
   
}

const handleResetPassword = async (req, res) => {
    try {

        const data = await loginRegisterService.resetUserPassword(req.body)

        return res.json({
            EC: data.EC,
            EM: data.EM
        })
       

    } catch (error) {
        return res.status(500).json({
            EC: -2,
            EM: 'Internal error',
            DT: ''
        })
    }
   
}


module.exports = {
    getLoginPage,
    verifySSOToken,
    getResetPasswordPage,
    sendCode,
    handleResetPassword
}
