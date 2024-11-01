const sgMail = require('@sendgrid/mail');
const { savePasswordResetToken } = require('../api/users/users.services');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


module.exports.sendPasswordResetEmail = async (name, email, resetToken) => {
  const resetPasswordLink = `${proccess.env.WEB_CLIENT_URL}/reset-password/${resetToken}`; // Replace with your frontend URL

  const msg = {
    to: email,
    from: 'welcome@chimptok.com',
    templateId: 'd-a9422d6569b145cda1853e8dc1f41d98', // Your template ID
    dynamic_template_data: {
      reset_password_link: resetPasswordLink,
      name,
    },
  };

  sgMail
    .send(msg)
    .then((response) => {
    })
    .catch((error) => {
      console.error('Error sending reset email:', error);
    });
};


module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  const encodedConfirmationCode = Buffer.from(confirmationCode).toString('base64');
  const confirmationLink = `${proccess.env.WEB_CLIENT_URL}/account-confirmation/${encodedConfirmationCode}`; // url do front, que vai pegar o confirmation code e vai mandar pro backend conferir

  const msg = {
    to: email,
    from: 'welcome@chimptok.com',
    templateId: 'd-f42682374d5743178a08d7e68aa3f580', 
    dynamic_template_data: {
      confirmation_link: confirmationLink,
      name,
    },
  };

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};
