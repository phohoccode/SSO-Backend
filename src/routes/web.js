require('dotenv').config()
import express from "express";
import passport from 'passport'
import homeController from '../controller/homeController';
import apiController from '../controller/apiController';
import loginController from '../controller/loginController'
import checkUser from '../middleware/checkUser'
import passportController from '../controller/passportController'

const router = express.Router();

/**
 * 
 * @param {*} app : express app
 */

const initWebRoutes = (app) => {
    //path, handler
    router.get("/", checkUser.isLogin, homeController.handleHelloWord);
    router.get("/user", homeController.handleUserPage);
    router.post("/users/create-user", homeController.handleCreateNewUser);
    router.post("/delete-user/:id", homeController.handleDelteUser)
    router.get("/update-user/:id", homeController.getUpdateUserPage);
    router.post("/user/update-user", homeController.handleUpdateUser);

    //rest api
    //GET - R, POST- C, PUT - U, DELETE - D
    // router.get("/api/test-api", apiController.testApi);

    router.get('/register', loginController.getRegisterPage)

    router.post('/register', loginController.handleRegister)

    router.get('/login', checkUser.isLogin, loginController.getLoginPage)

    router.post('/login', function (req, res, next) {
        passport.authenticate('local', function (error, user, info) {
            if (error) {
                return res.status(500).json(error);
            }

            if (!user) {
                return res.status(401).json(info.message);
            }

            req.login(user, function (err) {
                if (err) return next(err)   
                // trả dữ liệu về client
                console.log('>>> local-user', user)
                return res.status(200).json({ ...user, redirectURL: req.body.serviceURL })
            })
        })(req, res, next);
    });

    router.post('/logout', passportController.handleLogout);

    router.post('/verify-token', loginController.verifySSOToken)

    router.get('/auth/google', 
        passport.authenticate('google', { scope: ['profile', 'email'] }));

    router.get('/google/redirect',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function (req, res) {
            console.log('>>> google-user', req.user)
            return res.render('social.ejs', { ssoToken: req.user.code })
        });

    router.get('/auth/facebook', 
        passport.authenticate('facebook', { scope: ['email'] }));

    router.get('/facebook/redirect',
        passport.authenticate('facebook', { failureRedirect: '/login' }),
        function (req, res) {
            console.log('>>> facebook-user', req.user)

            return res.render('social.ejs', { ssoToken: req.user.code })
        });

    router.get('/forgot-password', loginController.getResetPasswordPage)

    router.post('/send-code', loginController.sendCode)

    router.post('/submit-reset-password', loginController.handleResetPassword)

    return app.use("/", router);
}

export default initWebRoutes;