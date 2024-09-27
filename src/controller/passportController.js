import passport from 'passport'
import LocalStrategy from 'passport-local'
import loginRegisterService from '../service/loginRegisterService'

const configPassport = () => {

    // Sử dụng LocalStrategy để xác thực người dùng dựa trên username và password.
    // Hàm verify là hàm xác thực được gọi khi người dùng cố gắng đăng nhập.
    passport.use(new LocalStrategy({
        passReqToCallback: true
    }, async (req, username, password, done) => {

        const rawData = {
            valueLogin: username,
            password: password
        }

        const res = await loginRegisterService.handleUserLogin(rawData)
        if (res && +res.EC === 0) {
            return done(null, res.DT);
        } else {
            return done(null, false, req.flash('message', res.EM));
        }
    }));
}

const handleLogout = (req, res, next) => {

    req.session.destroy(function (err) {
        req.logout()
        res.redirect('/')
    })
}

module.exports = {
    configPassport, handleLogout
}