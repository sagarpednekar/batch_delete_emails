const { google } = require("googleapis");

function authorization(access_token, refresh_token) {
   const oAuth2Client = new google.auth.OAuth2(
      "844957387775-n1co1m16j72jnh9gbusru3jj3rcrti0n.apps.googleusercontent.com",
      "tR2VCX9Tb0bvQWg0ZUDZnGEc",
      "http://localhost"
   );
   oAuth2Client.setCredentials({
      access_token,
      refresh_token,
      token_type: "Bearer"
   });
   return oAuth2Client;
}
module.exports = { authorization };
