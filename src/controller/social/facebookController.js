require('dotenv').config()
import passport from 'passport'
import loginRegisterService from '../../service/loginRegisterService'
const FacebookStrategy = require('passport-facebook').Strategy;
import { v4 as uuidv4 } from 'uuid'

const configLoginWithFacebook = () => {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_APP_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_APP_REDIRECT_LOGIN,
        profileFields: ['id', 'emails', 'name', 'displayName']
    },
        async function (accessToken, refreshToken, profile, cb) {
            console.log('>>> profile-facebook', profile)

            const typeAcc = 'FACEBOOK'
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

export default configLoginWithFacebook

