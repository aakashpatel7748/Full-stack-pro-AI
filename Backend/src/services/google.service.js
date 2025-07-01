import { google } from 'googleapis';
import config from '../config/config.js';
import userModel from '../models/user.model.js';


async function getGooGleAuth(userid) {
    const user = await userModel.findById(userid);
    console.log("Stored Refresh Token:", user.googleRefreshToken);
    if (!user) {
        throw new Error("User not found");
    }
    // const refreshToken = user.decryptGoogleRefreshToken();
    // console.log("Decrypted Refresh Token:", refreshToken); 


    const oAuth2Client = new google.auth.OAuth2(
        config.GOOGLE_CLIENT_ID,
        config.GOOGLE_CLIENT_SECRET,
        config.GOOGLE_REDIRECT_URI
    );
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // force Google to return refresh_token every time
        scope: ['https://www.googleapis.com/auth/gmail.send']
    });

    // console.log("Visit this URL to authenticate:", authUrl);
    
    oAuth2Client.setCredentials({ refresh_token: user.decryptGoogleRefreshToken() });
    return oAuth2Client;
}

export async function sendEmail(userid, to, subject, messages) {

    const auth = await getGooGleAuth(userid);
    const gmail = google.gmail({ version: 'v1', auth });

    const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        messages
    ].join('\n');


    const base64EncodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    return gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: base64EncodedEmail,
        }
    });

}