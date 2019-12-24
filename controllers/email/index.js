module.exports = google => {
  const gmail = google.gmail({
    version: "v1"
  });
  const readEmail = (messageId, index) => {
    return new Promise((resolve, reject) => {
      gmail.users.messages.get(
        {
          userId: "me",
          id: messageId
        },
        (err, res) => {
          //   if (err) console.log("Err -->", err);
          if (
            res &&
            res.data &&
            res.data.snippet &&
            res.data.payload &&
            res.data.payload.headers
          ) {
            // console.log("Reading ...." + index, res.data.snippet);
            // console.log("Reading ... " + index, res.data.payload.headers);
            res.data.payload.headers.map((header, index) => {
              // console.log("Message ID", messageId);
              const source = parseEmailBody(header);
              if (source) {
                resolve({
                  source,
                  snippet: res.data.snippet,
                  id: messageId
                });
              }
            });
          } else {
            console.log("Unable to read source");
            reject("Unable to read source");
          }
        }
      );
    });
  };
  const parseEmailBody = data => {
    const { name, value } = data;
    if (name === "From") {
      // console.log(value.split(" ")[0]);

      return value;
    }
  };

  const readEmails = async (resultCount, pageToken) => {
    const result = await gmail.users.getProfile({
      userId: "me"
    });

    return new Promise((resolve, reject) => {
      const reqObject = {
        userId: "me",
        maxResults: resultCount
      };
      if (pageToken) {
        reqObject.pageToken = pageToken;
      }
      gmail.users.messages.list(reqObject, (err, res) => {
        //   if (err) console.log(err);
        const messages =
          res && res.data && res.data.messages ? res.data.messages : [];
        if (messages.length > 0) {
          const response = new Promise((resolve, reject) => {
            resolve(
              messages.map((message, index) => readEmail(message.id, index))
            );
          })
            .then(emails => {
              return Promise.all(emails);
            })
            .catch(err => []);

          // console.log(response);
          return resolve({
            response,
            totalCount: result.data.messagesTotal,
            pageToken: res.data.nextPageToken ? res.data.nextPageToken : ""
          });
        }
      });
    });
  };

  const deleteEmailById = messageId => {
    return new Promise((resolve, reject) => {
      gmail.users.messages.delete(
        {
          userId: "me",
          id: messageId
        },
        (err, res) => {
          if (err) reject("Unable to delete email");
          console.log(res);
          resolve({ status: res });
        }
      );
    });
  };

  const deleteEmails = ids => {
    return new Promise((resolve, reject) => {
      gmail.users.messages.batchDelete(
        {
          userId: "me",
          requestBody: { ids }
        },
        (err, res) => {
          console.log(err);
          if (err) reject("Unable to delete");
          resolve(res);
        }
      );
    });
  };

  const email = {
    readEmails,
    readEmail,
    parseEmailBody,
    deleteEmailById,
    deleteEmails
  };

  return email;
};
