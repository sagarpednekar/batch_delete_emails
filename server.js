const express = require("express");
const app = express();
const PORT = 4000 || process.env.PORT;
const passport = require("passport");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const cors = require("cors");
const auth = require("./modules/email/auth");
const { authorization } = require("./controllers/auth/index");
const email = require("./controllers/email/index");
const { readEmails, deleteEmailById, deleteEmails } = email(google);

// give scope of the passport
auth(passport);

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ status: "200" });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://mail.google.com",
      "https://www.googleapis.com/auth/userinfo.profile"
    ],
    accessType: "offline",
    approvalPrompt: "force"
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/"
  }),
  (req, res) => {
    req.session.token = req.user.token;
    req.session.refreshToken = req.user.refreshToken;

    const auth = authorization(req.user.token, req.user.refreshToken);
    google.options({
      auth
    });

    res.redirect(
      process.env.base_url +
        "/?token=" +
        req.user.token +
        "?refresh_token=" +
        req.session.refreshToken
    );
  }
);

app.get("/", (req, res) => {
  if (req.session.token) {
    res.cookie("token", req.session.token);
    res.json({
      status: "session cookie set"
    });
  } else {
    res.cookie("token", "");
    res.json({
      status: "session cookie not set"
    });
  }
});

app.get("/list", async (req, res) => {
  const resultCount = req.query.results ? req.query.results : 10;
  const pageToken = req.query.pageToken ? req.query.pageToken : "";
  const emails = await readEmails(resultCount, pageToken);

  emails.response.then(response => {
    if (response) {
      res.json({ ...emails, response });
    } else {
      res.json([]);
    }
  });
});

app.delete("/delete/email/:id", (req, res) => {
  const { id } = req.params;
  if (id) {
    deleteEmailById(id)
      .then(response => {
        res.send(response);
      })
      .catch(err => {
        res.status(404).send(err);
      });
  } else {
    res.status(404).send("Id not found");
  }
});

app.post("/batch/delete", (req, res) => {
  const { ids } = req.body;
  if (ids && ids.length) {
    deleteEmails(ids)
      .then(result => {
        res.status(204).send(result);
      })
      .catch(err => {
        res.status(404).send(err);
      });
  } else {
    res.status(404).send("Id's not found");
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  req.session = null;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
