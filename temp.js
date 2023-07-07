function main(){
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.modify'],
      });
  
      console.log('Authorize this app by visiting this URL:', authUrl);
  
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
  
      rl.question('Enter the authorization code:', async (code) => {
        rl.close();
  
        const { tokens } = await oAuth2Client.getToken(code);
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
 
}

async function scanUnreadMessages(gmail) {
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
      await sendReply(gmail, messageData.data, replyText);
    }
  
    const messageIds = messages.map((message) => message.id);
  
    if (messageIds.length > 0) {
      await markMessagesAsRead(gmail, messageIds);
    } else {
      console.log('No unread messages found.');
    }
  }