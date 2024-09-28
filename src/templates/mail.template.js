export default function MAIL_TEMPLATE(otp) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #1e1e1e;
      margin: 0;
      padding: 0;
      color: #f0f0f0;
    }

    .email-container {
      background-color: #171A26;
      max-width: 600px;
      margin: 2rem auto;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      border-radius: 10px;
      overflow: hidden;
    }

    .header {
      text-align: center;
      background-color: #11EEFC;
      padding: 30px;
      font-size: 24px;
      color: white;
    }

    .header img {
      width: 100px;
      height: auto;
    }

    .content {
      padding: 30px;
      text-align: center;
    }

    .content h1 {
      color: #EAEAEA;
      margin-bottom: 20px;
      font-size: 28px;
    }

    .text {
      color: #EAEAEA;
      font-size: 16px;
      line-height: 1.5;
    }

    .otp {
      font-size: 50px;
      font-weight: bold;
      color: #FFD43D;
      margin: 20px 0;
    }

    .footer {
      background-color: #121212;
      padding: 20px;
      text-align: center;
      color: #777;
      font-size: 14px;
      border-top: 1px solid #333;
    }

    .footer a {
      color: #FF0C81;
      text-decoration: none;
    }
  </style>
</head>

<body>
  <div class="email-container">
    <div class="header">
       <img src="https://i.ibb.co/S3H6z0g/logo.png" alt="LOGO"/>
    </div>
    <div class="content">
      <h1>Welcome to OneTimex</h1>
      <p class="text">We are excited to have you on board. To complete your registration, please use the following OTP:</p>
      <p class="otp">${otp}</p>
      <p class="text">If you did not request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      Need help? Contact us at <a href="mailto:support@onetimex.in">support@onetimex.in</a><br>
      © 2024 OneTimex. All rights reserved.
    </div>
  </div>
</body>

</html>`;
};