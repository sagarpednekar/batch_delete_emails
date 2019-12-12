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
                  console.log("Reading ...." + index, res.data.snippet);
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

   const readEmails = () => {
      return new Promise((resolve, reject) => {
         gmail.users.messages.list(
            {
               userId: "me",
               maxResults: 10
            },
            (err, res) => {
               //   if (err) console.log(err);
               //   console.log("--->", res.data.messages);
               const messages =
                  res && res.data && res.data.messages ? res.data.messages : [];
               if (messages.length > 0) {
                  const response = new Promise((resolve, reject) => {
                     resolve(
                        messages.map((message, index) =>
                           readEmail(message.id, index)
                        )
                     );
                  }).then(array => {
                     console.log("Count", array.length);
                     return Promise.all(array);
                     //  .then(item => {
                     //     console.log("Item", item);
                     //  })
                     //  .catch(err => {
                     //     console.log(err);
                     //  });
                  });

                  return resolve(response);
               }
            }
         );
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
               userId: "me"
            },
            {
               body: { ids: JSON.stringify(ids) }
            },
            {
               headers: { "Content-Type": "application/json" }
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
