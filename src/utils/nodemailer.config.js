// module.exports.sendPasswordResetEmail = (name, email, resetCode) => {
//   console.log('Check');
//   transport.sendMail({
//     from: user,
//     to: email,
//     subject: 'Please confirm your account',
//     html: `<h1>Password Reset</h1>
//         <h2>I know how you feel, it happens to everyone ${name}</h2>
//         <p>Click on the link to reset your password and continue killing your tasks</p>
//         <a href=http://localhost:5000/auth/reset-password/${resetCode}>Click here</a>
//         </div>`,
//   }).catch((err) => console.log(err));
// };

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  const encodedConfirmationCode = Buffer.from(confirmationCode).toString('base64');
  const confirmationLink = `http://localhost:4000/account-confirmation/${encodedConfirmationCode}`; // url do front, que vai pegar o confirmation code e vai mandar pro backend conferir

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
      console.log('RESPONSE DO SENDGRID', response);
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};
