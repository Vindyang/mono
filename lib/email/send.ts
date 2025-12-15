import { Resend } from "resend";
import { getInvitationEmailHtml, getInvitationEmailText } from "./templates";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email using Resend
    const emailFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;

    if (!emailFrom) {
      console.error("EMAIL_FROM or RESEND_FROM_EMAIL environment variable is not set");
      // Fall back to logging in development
      if (process.env.NODE_ENV === "development") {
        console.log("========================================");
        console.log("INVITATION EMAIL (Development Mode - No EMAIL_FROM)");
        console.log("========================================");
        console.log("To:", to);
        console.log("Subject:", `You're invited to join ${workspaceName}`);
        console.log("Invitation URL:", invitationUrl);
        console.log("Expires:", expiresAt.toLocaleString());
        if (projectNames && projectNames.length > 0) {
          console.log("Projects:", projectNames.join(", "));
        }
        console.log("========================================");
        return { success: true };
      }
      return {
        success: false,
        error: "Email sender address not configured",
      };
    }

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: to,
      subject: `You're invited to join ${workspaceName}`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error("Resend email error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    console.log("Invitation email sent successfully:", data?.id);
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
 * - RESEND_API_KEY: Your Resend API key from resend.com
 * - EMAIL_FROM or RESEND_FROM_EMAIL: Verified sender email (e.g., "noreply@yourdomain.com")
 * - NEXT_PUBLIC_APP_URL: Your application URL for invitation links
 */
