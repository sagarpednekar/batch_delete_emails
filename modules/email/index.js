const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://mail.google.com/"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Gmail API.
  //   authorize(JSON.parse(content), listLabels);
  authorize(JSON.parse(content), readEmails);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  gmail.users.labels.list(
    {
      userId: "me"
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const labels = res.data.labels;
      if (labels.length) {
        console.log("Labels:");
        labels.forEach(label => {
          console.log(`- ${label.name}`);
        });
      } else {
        console.log("No labels found.");
      }
    }
  );
}

function readEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const labels = [];
  gmail.users.messages.list(
    {
      userId: "me",
      maxResults: 200
    },
    async (err, res) => {
      //   if (err) console.log(err);
      //   console.log("--->", res.data.messages);
      const messages =
        res && res.data && res.data.messages ? res.data.messages : [];
      if (messages.length > 0) {
        const response = new Promise((resolve, reject) => {
          resolve(
            messages.map((message, index) => readEmail(message.id, index, auth))
          );
        }).then(async array => {
          console.log(typeof array);
          Promise.all(array).then(item => {
            console.log(item);
          });
          console.log();
        });
      }
    }
  );
}

function readEmail(messageId, index, auth) {
  const gmail = google.gmail({
    version: "v1",
    auth
  });
  return new Promise((resolve, reject) => {
    gmail.users.messages.get(
      {
        userId: "me",
        id: messageId
      },
      (err, res) => {
        //   if (err) console.log("Err -->", err);
        if (res && res.data && res.data.payload && res.data.payload.headers) {
          // console.log("Reading ...." + index, res.data.snippet);
          // console.log("Reading ... " + index, res.data.payload.headers);
          res.data.payload.headers.map((header, index) => {
            const source = parseEmailBody(header);
            if (source) {
              resolve(source);
            }
          });
        } else {
          // console.log("Unable to read email");
        }
      }
    );
  });
}

function parseEmailBody(data) {
  const { name, value } = data;
  if (name === "From") {
    // console.log(value.split(" ")[0]);

    return value;
  }
}
