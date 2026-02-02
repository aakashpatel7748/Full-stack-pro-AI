import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import config from "../config/config.js";
import userModel from "../models/user.model.js"



console.log("Passport Strategy Initializing...");
console.log("Redirect URL:", config.GOOGLE_REDIRECT_URL);
console.log("Client ID:", config.GOOGLE_CLIENT_ID ? "Found" : "Missing");

passport.use(new Strategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_REDIRECT_URL,
    passReqToCallback: true,
    accessType: "offline",
    prompt: "consent"
}, async (req, accessToken, refreshToken, profile, done) => {
    // Here you can save the user profile to your database
    // console.log("access token-->>", accessToken)
    // console.log("refresh token-->>", refreshToken)

    const user = await userModel.findOne({ email: profile.emails[0].value })

    if (user) {

        // user already exists , update refresh token
        if (refreshToken) {
            user.googleRefreshToken = refreshToken; // only overwrite if defined
            await user.save();
        }
        return done(null, user);
    }

    // if user doen not exist , create a new user
    const newUser = new userModel({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleRefreshToken: refreshToken
    })

    await newUser.save()
    return done(null, newUser)

}

))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})


// 👇 Add this AFTER strategy
Strategy.prototype.authorizationParams = function (options) {
    return {
        access_type: 'offline',
        prompt: 'consent'
    };
};
export default passport