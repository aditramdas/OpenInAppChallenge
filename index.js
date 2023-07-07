require('dotenv').config()
const {google} = require('googleapis');
const nodemailer = require('nodemailer');


/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const client_id  = process.env.client_id;
const client_secret = process.env.client_secret;
const redirect_uri = process.env.redirect_uri;
const refresh_token = process.env.refresh_token;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);
oAuth2Client.setCredentials({
    refresh_token: refresh_token
});

// Access scopes for read-only Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

// Generate a url that asks permissions for the Drive activity scope
async function sendEmail(){
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'aditramdas@gmail.com',
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: process.env.refresh_token,
                accessToken: accessToken
            }
        });
        const mailOptions = {
            from: 'Adith Ramdas <aditramdas@gmail.com>',
            to: 'tve21cs014@cet.ac.in',
            subject: 'Hello from gmail using API',
            text: 'Hello from gmail email using API',
            html: '<h1>Hello from gmail email using API</h1>'
        };
        
        const result = await transport.sendMail(mailOptions);
        return result;

    } catch (error) {
        return error;
    }
}
sendEmail().then((result) => console.log('Email sent...', result))
.catch((error) => console.log(error.message));




