const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
require("dotenv").config()
module.exports = passport => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.client_id,
        clientSecret: process.env.client_secret,
        callbackURL: "/auth/google/callback"
      },
      (token, refreshToken, profile, done) => {
        return done(null, {
          profile,
          token,
          refreshToken
        });
      }
    )
  );
};
