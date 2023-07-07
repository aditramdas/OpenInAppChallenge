require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const readline = require('readline');

const client_id = process.env.client_id;
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


const scopes = ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.labels', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email' , 'https://www.googleapis.com/auth/gmail.compose', 'https://mail.google.com/']
const LABEL_NAME = 'Replied';

async function sendReplyAndLabel(gmail, message, replyText) {
    const recipient = message.payload.headers.find((header) => header.name === 'From').value;
    const subject = message.payload.headers.find((header) => header.name === 'Subject').value;
    const userInfo = await google.oauth2('v2').userinfo.get({ auth: oAuth2Client });
    const senderEmail = userInfo.data.email;
    console.log(senderEmail)
  const { token } = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: senderEmail,
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: refresh_token,
        accessToken: token,
      },
    });
 
    const mailOptions = {
      from: senderEmail,
      to: recipient,
      subject: `Re: ${subject}`,
      text: replyText,
      html : '<h1> Hello </h1>'
    };
  
    transporter.sendMail(mailOptions);
  
    console.log('Replied to message:', message.id);
  
    // Label the replied message
    const labelResponse = await gmail.users.labels.list({ userId: 'me' });
    const replyLabel = labelResponse.data.labels.find((label) => label.name === LABEL_NAME);
  
    if (!replyLabel) {
      const createLabelResponse = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: LABEL_NAME,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
      console.log('Created label:', createLabelResponse.data.name);
      
      await gmail.users.messages.modify({
        userId: 'me',
        id: message.id,
        requestBody: {
          addLabelIds: [createLabelResponse.data.id],
        },
      });
      console.log('Labeled:', message.id);
    } else {
      await gmail.users.messages.modify({
        userId: 'me',
        id: message.id,
        requestBody: {
          addLabelIds: [replyLabel.id],
        },
      });
      console.log('Labeled:', message.id);
    }
  }
      

  async function scanUnrepliedMessages(gmail) {
    console.log('Scanning for unreplied messages...');
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
    });
  
    const messages = response.data.messages || [];
  
    for (const message of messages) {
      const messageData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });
  
      const threadId = messageData.data.threadId;
      const threadResponse = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
      });
  
      const thread = threadResponse.data;
      const isReplied = thread.messages.length > 1;
  
      if (!isReplied) {
        const replyText = 'Hey, this is an automated reply. Will be connecting with you soon. Thanks';
        await sendReplyAndLabel(gmail, messageData.data, replyText);
      }
    }
  
    if (messages.length > 0) {
      console.log('Process complete.');
    } else {
      console.log('No unreplied messages found.');
    }
  }

async function main() {
    try {
      console.log('Starting Gmail API...');
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });
  
      console.log('Authorize this app by visiting this URL:', authUrl);
  
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
  
      rl.question('Enter the authorization code:', async (code) => {
        rl.close();
  
        const { tokens } = await oAuth2Client.getToken(code);
        const refreshToken = tokens.refresh_token; 
        oAuth2Client.setCredentials(tokens);
  
        // Create Gmail API client
       const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  
        // Initial scan for unread messages
        await scanUnrepliedMessages(gmail);
  
        // Set interval to scan for new unread messages every 45 seconds
        setInterval(async () => {
          await scanUnrepliedMessages(gmail);
        }, 45000);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
main();
