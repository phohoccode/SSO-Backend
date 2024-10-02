require('dotenv').config()
import passport from 'passport'
import loginRegisterService from '../../service/loginRegisterService'
const GoogleStrategy = require('passport-google-oauth20').Strategy;
import { v4 as uuidv4 } from 'uuid'

const configLoginWithGoogle = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_APP_CLIENT_ID,
        clientSecret: process.env.GOOGLE_APP_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_APP_REDIRECT_LOGIN
    },
        async function (accessToken, refreshToken, profile, cb) {
            console.log('>>> profile-google', profile)

            const typeAcc = 'GOOGLE'
            const dataRaw = {
                username: profile.displayName,
                email: profile.emails && profile.emails.length > 0 ? 
                    profile.emails[0].value : profile.id
            }

            const user = await loginRegisterService.upsertUserSocialMedia(typeAcc, dataRaw)
            user.code = uuidv4()

            return cb(null, user);
        }
    ));
}

export default configLoginWithGoogle

