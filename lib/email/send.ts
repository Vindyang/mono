import * as brevo from "@getbrevo/brevo";
import { getInvitationEmailHtml, getInvitationEmailText } from "./templates";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

interface SendInvitationEmailParams {
  to: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationId: number;
  expiresAt: Date;
  projectNames?: string[];
}

export async function sendInvitationEmail(params: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      to,
      inviterName,
      workspaceName,
      role,
      invitationId,
      expiresAt,
      projectNames,
    } = params;

    // Generate invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/invite/${invitationId}`;

    // Generate email content
    const htmlContent = getInvitationEmailHtml({
      inviteeEmail: to,
      inviterName,
      workspaceName,
      role,
      invitationUrl,
      expiresAt,
      projectNames,
    });

    const textContent = getInvitationEmailText({
      inviteeEmail: to,
      inviterName,
      workspaceName,
      role,
      invitationUrl,
      expiresAt,
      projectNames,
    });

    // Send email using Brevo
    const emailFrom = process.env.EMAIL_FROM || "noreply@example.com";
    const fromName = process.env.EMAIL_FROM_NAME || "Your App";

    // Log invitation details for debugging
    console.log("========================================");
    console.log("SENDING INVITATION EMAIL");
    console.log("========================================");
    console.log("To:", to);
    console.log("From:", emailFrom);
    console.log("Subject:", `You're invited to join ${workspaceName}`);
    console.log("Invitation URL:", invitationUrl);
    console.log("Expires:", expiresAt.toLocaleString());
    if (projectNames && projectNames.length > 0) {
      console.log("Projects:", projectNames.join(", "));
    }
    console.log("========================================");

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: emailFrom, name: fromName };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = `You're invited to join ${workspaceName}`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("Invitation email sent successfully:", result.body?.messageId);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Required environment variables:
 * - BREVO_API_KEY: Your Brevo API key from app.brevo.com
 * - EMAIL_FROM: Sender email (e.g., "noreply@yourdomain.com" or use Brevo's default)
 * - EMAIL_FROM_NAME: Sender name (e.g., "Your App Name")
 * - NEXT_PUBLIC_APP_URL: Your application URL for invitation links
 */
