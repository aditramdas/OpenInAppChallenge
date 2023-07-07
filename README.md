# OpenInApp Challenge
This project is a NodeJS app that would list out the unread email (set to a maximum of 5, at the moment) and would reply to emails which is not already replied to. 

![image](https://github.com/aditramdas/OpenInAppChallenge/assets/68638084/3af77cdf-7b9d-4007-8b06-aebdbfcadbab)

![image](https://github.com/aditramdas/OpenInAppChallenge/assets/68638084/c45fb40f-c417-41fd-b801-cd0a64b97d88)

![image](https://github.com/aditramdas/OpenInAppChallenge/assets/68638084/5dad9449-b8e6-4b43-a35b-485fafad5311)

# APIs Used
Here, we have used the GMail API to implement this project, along with nodemailer to send emails. 
GMail API is part of the Google APIs and would require authentication from Google Cloud Console in the first use. Thereafter, if the app is published, any person will be able to use the app after authentication.

Nodemailer is an open-source tool used to send emails. There are different methods to authenticate for emailing, but here we have used the OAuth method. First, an interface is created which includes the Authentication type and user details(having Client_ID, Client_Secret, AccessToken, and RefreshToken). Then we specify mailOptions which provides details about the mail to be sent.

# Demo Video - [Video Link](https://drive.google.com/file/d/1pcLSodtuJRuBEM5-wfaQP-ryFD3TeD_5/view?usp=sharing)

# How the tool works
The tool is a Node.js application that utilizes the Gmail API to automate the process of identifying and handling unreplied email threads. It authenticates with the user's Gmail account using OAuth2 and scans for unread messages. It determines if a message is part of an unreplied thread by checking the thread length. If a thread has only one message, it is considered unreplied. The tool then sends an automated reply to the sender using Nodemailer, labels the email with a custom label in Gmail, and marks it as read. The process repeats at random intervals between 45 to 120 seconds, ensuring timely handling of unreplied emails.

# How to configure and Run
1) Clone the repo into the local machine.
2) Instal the necessary dependencies
3) Configure Google Auth from Google Cloud Console
4) Configure the '.env' file according to the template provided
5) Type "node index.js" and then authenticate the app by clicking the link when prompted

# Where I can improve
I can improve my code to show the output in a formatted way in a web browser which would make user access easier. This would be used only by developers, and not the common people, which comes off as a con.
