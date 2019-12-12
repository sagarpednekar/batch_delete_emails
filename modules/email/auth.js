const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
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
            clientID:
               "844957387775-n1co1m16j72jnh9gbusru3jj3rcrti0n.apps.googleusercontent.com",
            clientSecret: "tR2VCX9Tb0bvQWg0ZUDZnGEc",
            callbackURL: "/auth/google/callback"
         },
         (token, refreshToken, profile, done) => {
            console.log(refreshToken);
            return done(null, {
               profile,
               token,
               refreshToken
            });
         }
      )
   );
};
