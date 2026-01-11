export const otpTemplate = ({
  title,
  message,
  code,
  link,
  footer,
}: {
  title: string;
  message: string;
  code: string;
  link: string;
  footer: string;
}) => `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
  <div style="max-width: 550px; margin: auto; background-color: #ffffff; padding: 35px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 25px;">
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">${title}</h2>
    </div>

    <!-- Message -->
    <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 25px;">
      ${message}
    </p>

    <!-- OTP Code -->
    <div style="text-align: center; margin-bottom: 25px;">
      <p style="font-size: 18px; color: #555; margin-bottom: 8px;">Your one-time code:</p>
      <p style="font-size: 24px; font-weight: bold; color: #111; background-color: #f7f7f7; display: inline-block; padding: 12px 20px; border-radius: 6px; letter-spacing: 3px; border: 1px solid #ddd;">
        ${code}
      </p>
    </div>

    <!-- Link -->
    <div style="text-align: center; margin-bottom: 25px;">
      <a href="${link}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Verify Now
      </a>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">Or copy and paste this link: <br> <a href="${link}" style="color: #007bff;">${link}</a></p>
    </div>

    <!-- Footer -->
    <hr style="border:none; border-top:1px solid #eee; margin: 25px 0;">
    <p style="font-size: 13px; color: #999; text-align: center; margin: 0;">
      ${footer}
    </p>

  </div>
</div>
`;
