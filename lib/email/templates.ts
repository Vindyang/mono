/**
 * Email templates for the application
 */

interface InvitationEmailData {
  inviteeEmail: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationUrl: string;
  expiresAt: Date;
  projectNames?: string[];
}

export function getInvitationEmailHtml(data: InvitationEmailData): string {
  const {
    inviterName,
    workspaceName,
    role,
    invitationUrl,
    expiresAt,
    projectNames,
  } = data;

  const expiryDate = expiresAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${workspaceName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                You're invited to join ${workspaceName}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Hi there,
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                <strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> as a <strong>${role}</strong>.
              </p>

              ${
                projectNames && projectNames.length > 0
                  ? `
              <p style="margin: 0 0 10px; font-size: 16px; line-height: 24px; color: #374151;">
                You'll be assigned to the following projects:
              </p>
              <ul style="margin: 0 0 20px; padding-left: 20px;">
                ${projectNames.map((name) => `<li style="margin: 5px 0; font-size: 16px; color: #374151;">${name}</li>`).join("")}
              </ul>
              `
                  : ""
              }

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #374151;">
                Click the button below to accept the invitation and start collaborating:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${invitationUrl}" style="display: inline-block; padding: 12px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                This invitation will expire on <strong>${expiryDate}</strong>.
              </p>

              <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${invitationUrl}" style="color: #3b82f6; text-decoration: underline;">${invitationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getInvitationEmailText(data: InvitationEmailData): string {
  const {
    inviterName,
    workspaceName,
    role,
    invitationUrl,
    expiresAt,
    projectNames,
  } = data;

  const expiryDate = expiresAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let text = `
You're invited to join ${workspaceName}

${inviterName} has invited you to join ${workspaceName} as a ${role}.
`;

  if (projectNames && projectNames.length > 0) {
    text += `
You'll be assigned to the following projects:
${projectNames.map((name) => `- ${name}`).join("\n")}
`;
  }

  text += `
To accept the invitation, visit:
${invitationUrl}

This invitation will expire on ${expiryDate}.

If you weren't expecting this invitation, you can safely ignore this email.
  `.trim();

  return text;
}

interface MagicLinkEmailData {
  email: string;
  magicLinkUrl: string;
}

export function getMagicLinkEmailHtml(data: MagicLinkEmailData): string {
  const { magicLinkUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to your account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                Sign in to your account
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                Hi there,
              </p>

              <p style="margin: 0 0 30px; font-size: 16px; line-height: 24px; color: #374151;">
                Click the button below to securely sign in to your account. This link will expire in 5 minutes.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${magicLinkUrl}" style="color: #3b82f6; text-decoration: underline; word-break: break-all;">${magicLinkUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getMagicLinkEmailText(data: MagicLinkEmailData): string {
  const { magicLinkUrl } = data;

  return `
Sign in to your account

Click the link below to securely sign in to your account:
${magicLinkUrl}

This link will expire in 5 minutes.

If you didn't request this email, you can safely ignore it.
  `.trim();
}
