import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

const APP_NAME = 'H&R Industrial Services';
admin.initializeApp(functions.config().firebase);
const mainEmail: any = functions.config().main.email;
const mainPassword: any = functions.config().main.password;

const Transporter: nodemailer.Transporter = nodemailer.createTransport({
  name: 'info@hamiltonrappold.com',
  service: 'Zoho',
  auth: {
    user: mainEmail,
    pass: mainPassword,
  },
});

async function sendSubscriberWelcomeEmail(email: string) {
  const mailOptions: MailOptions = {
    from: `"${APP_NAME}" info@hamiltonrappold.com`,
    to: email,
    subject: `Thanks for subscribing to the ${APP_NAME} updates!`,
    text: `Thank you for subscribing to updates! We will send you the latest launch dates for our new website, as well as other important information.`
  };

  // The user subscribed to updates and the newsletter, send welcome email to user.
  await sendEmail(mailOptions);
  return null;
}

exports.sendSubscriberEmail = functions.firestore
  .document('subscribers/{subscriberId}')
  .onCreate((snap: any, context: any) => {
    const resource = context.resource;
    const subscriber: any = snap.data();
    if (snap.exists) {
      return sendSubscriberWelcomeEmail(subscriber.email)
        .then(res => console.log(res))
        .catch(err => console.log('ERROR add subscriber', err))
    } else {
      console.log(`Failed to send subscriber email on ${resource}`, snap, context);
      return null;
    }
  })

async function sendContactEmail(name: string, email: string, msg: string) {
  const mailOptions: MailOptions = {
    from: `"${APP_NAME}" info@hamiltonrappold.com`,
    to: email,
    subject: `Thanks for contacting ${APP_NAME}, ${name}!`,
    text: `Thank you for contacting ${APP_NAME}! We value your input, and will respond within 48 hours.`
  };

  const sendHomeOptions: MailOptions = {
    from: `"${email}"`,
    to: 'info@hamiltonrappold.com',
    subject: `You Have A New Quote Request From ${name}`,
    text: msg
  }

  // The user subscribed to updates and the newsletter, send welcome email to user.
  await sendEmail(mailOptions);
  await sendEmail(sendHomeOptions);
  return null;
}

exports.sendContactEmail = functions.firestore
  .document('contacts/{contactId}')
  .onCreate((snap: any, context: any) => {
    const resource = context.resource;
    const contact: any = snap.data();
    if (snap.exists) {
      return sendContactEmail(contact.name, contact.email, contact.msg)
        .then(res => console.log(res))
        .catch(err => console.log('ERROR adding to Contacts', err))
    } else {
      console.log(`Failed to send Contact email on ${resource}`, snap, context);
      return null;
    }
  })

async function sendEmail(options: nodemailer.SendMailOptions) {
  return await Transporter.sendMail(options);
}


