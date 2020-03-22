const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = '';

sgMail.setApiKey(sendgridAPIKey);

// sgMail.send({
//     to: 'soumya.kanti.pal.email@gmail.com',
//     from: 's.kpal@yahoo.in',
//     subject: 'This is my first creation!',
//     text: 'I hope this will reach you.'
// });

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 's.kpal@yahoo.in',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}. Let me know how to you get along with the app.`
    });
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 's.kpal@yahoo.in',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};