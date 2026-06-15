import { BrevoClient } from "@getbrevo/brevo";
import { BREVO_API_KEY, APP_URL, SENDER_EMAIL } from "../config/environment.js";

class MailService {
  constructor() {
    this.useBrevo = !!BREVO_API_KEY;
    if (this.useBrevo) {
      this.brevoClient = new BrevoClient({ apiKey: BREVO_API_KEY });
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
      const result = await this.brevoClient.transactionalEmails.sendTransacEmail({
        subject: "Verify Your Email - FluxyAI",
        htmlContent: `
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
        `,
        sender: { name: "FluxyAI", email: SENDER_EMAIL },
        to: [{ email, name: username }]
      });
      console.log(`Verification email sent to ${email} via Brevo.`);
      return { success: true, mode: "brevo", result };
    } catch (error) {
      console.error(`Failed to send verification email to ${email} via Brevo:`, error);
      throw error;
    }
  }
}

export default new MailService();