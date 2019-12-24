const { google } = require("googleapis");
require("dotenv").config();

function authorization(access_token, refresh_token) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.client_id,
    process.env.client_secret,
    "http://pretty-mail.herokuapp.com"
  );
  oAuth2Client.setCredentials({
    access_token,
    refresh_token,
    token_type: "Bearer"
  });
  return oAuth2Client;
}
module.exports = { authorization };
