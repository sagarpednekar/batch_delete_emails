const router = require("express").Router();
const {
  readEmails,
  deleteEmailById,
  deleteEmails
} = require("../controllers/email");

router.get("list/email", (req, res) => {
  readEmails()
    .then(response => {
      if (response) {
        res.json(response);
      } else {
        res.json([]);
      }
    })
    .catch(error => {
      res.status(404).send({
        error: true
      });
    });
});

router.delete("/delete/email/:id", (req, res) => {
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

router.post("/batch/delete", (req, res) => {
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

module.exports = { router };
