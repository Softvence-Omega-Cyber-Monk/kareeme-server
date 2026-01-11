export const adminInvitationTemplate = (
  name: string,
  email: string,
  password: string,
  link: string,
) => `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #2c3e50; margin: 0; font-size: 26px;">Welcome to the Team!</h2>
      <p style="color: #7f8c8d; font-size: 16px; margin-top: 10px;">You have been invited to join the administration team.</p>
    </div>

    <!-- Message -->
    <p style="font-size: 16px; color: #34495e; line-height: 1.6; margin-bottom: 20px;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="font-size: 16px; color: #34495e; line-height: 1.6; margin-bottom: 30px;">
      An account has been created for you with the email <strong>${email}</strong>. Please use the credentials below to log in and set up your account.
    </p>

    <!-- Credentials -->
    <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
      <p style="margin: 0 0 10px 0; color: #555; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Temporary Credentials</p>
      <p style="margin: 5px 0; font-size: 16px; color: #333;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 5px 0; font-size: 16px; color: #333;"><strong>Password:</strong> <span style="font-family: monospace; background-color: #eee; padding: 2px 6px; border-radius: 3px;">${password}</span></p>
    </div>

    <p style="font-size: 14px; color: #e74c3c; margin-bottom: 30px;">
      * Please change your password immediately after logging in for security.
    </p>

    <!-- Call to Action -->
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${link}" style="background-color: #3498db; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
        Log In to Dashboard
      </a>
      <p style="font-size: 12px; color: #999; margin-top: 15px;">Or copy this link: <a href="${link}" style="color: #3498db;">${link}</a></p>
    </div>

    <!-- Footer -->
    <hr style="border:none; border-top:1px solid #eee; margin: 30px 0;">
    <p style="font-size: 13px; color: #95a5a6; text-align: center; margin: 0;">
      If you believe this invitation was sent in error, please contact support.
    </p>

  </div>
</div>
`;
