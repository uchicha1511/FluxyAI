import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";
import { BREVO_API_KEY, APP_URL } from "../config/environment.js";

class MailService {
  constructor() {
    this.useBrevo = !!BREVO_API_KEY;
    if (this.useBrevo) {
      this.apiInstance = new TransactionalEmailsApi();
      const apiKey = this.apiInstance.authentications["apiKey"];
      apiKey.apiKey = BREVO_API_KEY;
    }
  }

  async sendVerificationEmail(email, username, token) {
    const verificationUrl = `${APP_URL}/api/auth/verify?token=${token}`;

    if (!this.useBrevo) {
      console.log("\n==================================================");
      console.log(`[Development Mode] Verification Email for ${username} (${email})`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log("==================================================\n");
      return { success: true, mode: "console", verificationUrl };
    }

    try {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = "Verify Your Email - FluxyAI";
      sendSmtpEmail.htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2>Welcome to FluxyAI, ${username}!</h2>
            <p>Please verify your email address to activate your account by clicking the link below:</p>
            <p>
              <a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </p>
            <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link is valid for 1 hour.</p>
          </body>
        </html>
      `;
      sendSmtpEmail.sender = { name: "FluxyAI Auth", email: "no-reply@fluxyai.com" };
      sendSmtpEmail.to = [{ email, name: username }];

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Verification email sent to ${email} via Brevo.`);
      return { success: true, mode: "brevo", result };
    } catch (error) {
      console.error(`Failed to send verification email to ${email} via Brevo:`, error);
      throw error;
    }
  }
}

export default new MailService();
