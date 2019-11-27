const express = require("express");
const app = express();
const PORT = 3000 || process.env.PORT;
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const auth = require("./modules/email/auth");
const { authorization } = require("./controllers/auth/index");
const email = require("./controllers/email/index");
const { readEmails, deleteEmailById, deleteEmails } = email(google);

// give scope of the passport
auth(passport);

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(
   cookieSession({
      name: "session",
      keys: ["123"]
   })
);

app.use(cookieParser());

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
      console.log(req.user);
      req.session.token = req.user.token;
      req.session.refreshToken = req.user.refreshToken;

      const auth = authorization(req.user.token, req.user.refreshToken);
      google.options({
         auth
      });

      res.redirect(
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

app.get("/list", (req, res) => {
   const mails = readEmails();
   mails.then(response => {
      if (response) {
         res.json(response);
      } else {
         res.json([]);
      }
   });
   //  console.log("Mails ", mails);
});

app.delete("/delete/email/:id", (req, res) => {
   const { id } = req.params;
   console.log(id);
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
   console.log(ids);
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
