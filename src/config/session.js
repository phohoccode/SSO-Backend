import Sequelize from "sequelize"
import session from "express-session"
import passport from 'passport'

const configSession = (app) => {
    const SequelizeStore = require("connect-session-sequelize")(session.Store);

    // Tạo kết nối đến sequelize
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
        define: {
            freezeTableName: true
        },
        timezone: '+07:00'
    })

    // Tạo store để lưu trữ sesstion thông qua Sequelize:
    const myStore = new SequelizeStore({
        db: sequelize,
    })

    // Thiết lập middleware express-session:
    app.use(session({
        secret: "keyboard cat",
        store: myStore,
        resave: false,
        proxy: true,
        saveUninitialized: false,
        expiration: 300 * 1000,
        cookie: { expires: 300 * 1000 }
    }));


    // tạo bảng sesstion trong db
    myStore.sync()

    // xác thực người dùng dựa vào sesstion
    app.use(passport.authenticate('session'))

    // Mã hóa: chuyển định dạng user thành dạng có thể lưu trữ trong session
    passport.serializeUser(function (user, cb) {
        process.nextTick(function () {
            cb(null, user)
        });
    });

    // Giải mã hóa: chuyển định dạng từ session trở lại thành đối tượng user
    passport.deserializeUser(function (user, cb) {
        process.nextTick(function () {
            return cb(null, user);
        });
    });
}

export default configSession