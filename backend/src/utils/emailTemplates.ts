export const generateOtpEmail = (otp: string, userName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SkillMatch - Password Reset OTP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a73e8;
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      font-size: 16px;
      color: #333333;
      line-height: 1.5;
    }
    .otp {
      display: inline-block;
      background-color: #1a73e8;
      color: #ffffff;
      font-size: 20px;
      letter-spacing: 2px;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #999999;
      margin-top: 30px;
      text-align: center;
    }
    a {
      color: #1a73e8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello ${userName},</h1>
    <p>We received a request to reset your password for your SkillMatch account.</p>
    <p>Your One-Time Password (OTP) is:</p>
    <div class="otp">${otp}</div>
    <p>Please enter this code in the app to reset your password. This OTP is valid for <strong>10 minutes</strong>.</p>
    <p>If you did not request a password reset, please ignore this email or contact support.</p>
    <div class="footer">
      &copy; 2026 SkillMatch. All rights reserved.<br/>
      <a href="https://skillMatch.com">www.skillMatch.com</a>
    </div>
  </div>
</body>
</html>
`;
