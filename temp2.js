require('dotenv').config()
const {google} = require('googleapis');
const nodemailer = require('nodemailer');
const readline = require('readline');

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
    
    
    const LABEL_NAME = 'Replied';
    
    


    async function sendReplyAndLabel(gmail, message, replyText) {
        const recipient = message.payload.headers.find((header) => header.name === 'From').value;
        const subject = message.payload.headers.find((header) => header.name === 'Subject').value;
        const { token } = await oAuth2Client.getAccessToken();
        
        // Send the reply email using Nodemailer
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'aditramdas@gmail.com', // Replace with your email address
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: refresh_token,
                accessToken: token,
            },
        });
        const mailOptions = {
            from: 'adithramdas.12a@gmail.com', 
            to: recipient,
            subject: `Re: ${subject}`,
            text: replyText,
        };
  
    await transporter.sendMail(mailOptions);
  
    console.log('Replied to message:', message.id);

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
        removeLabelIds: ['UNREAD'],
      },
    });
    console.log('Labeled and marked as read:', message.id);
  } else {
    await gmail.users.messages.modify({
      userId: 'me',
      id: message.id,
      requestBody: {
        addLabelIds: [replyLabel.id],
        removeLabelIds: ['UNREAD'],
      },
    });
    console.log('Labeled and marked as read:', message.id);
  }
}

async function scanUnreadMessages(gmail) {
    console.log('Scanning for unread messages...');
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

    const replyText = 'This is an automated reply.';
    await sendReplyAndLabel(gmail, messageData.data, replyText);
  }

  if (messages.length > 0) {
    console.log('Process complete.');
  } else {
    console.log('No unread messages found.');
  }
}

async function main() {
    try {
      console.log('Starting Gmail API...');
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.labels'],
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
        await scanUnreadMessages(gmail);
  
        // Set interval to scan for new unread messages every 45 seconds
        setInterval(async () => {
          await scanUnreadMessages(gmail);
        }, 45000);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
main();