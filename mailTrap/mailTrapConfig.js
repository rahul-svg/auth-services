const { MailtrapClient } = require('mailtrap');
require('dotenv').config();

 const mailtrapClient = new MailtrapClient({
  // endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

module.exports = {
  sender,mailtrapClient
}
