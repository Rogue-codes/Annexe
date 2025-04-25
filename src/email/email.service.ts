import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Auction } from 'src/aution/entities/aution.entity';
import { User } from 'src/user/entities/user.entity';
import { format } from 'date-fns';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.USERNAME,
        pass: process.env.APP_PASSWORD,
      },
    });
  }

  async sendAccountVerificationMail(user: User, verificationCode: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'Ticketplace@ticketplace.co',
      to: user.email,
      subject: 'VERIFY YOUR ACCOUNT',
      text: 'Account Verification',
      html: `<html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Account</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              width: 80%;
              margin: 20px auto;
              padding: 20px;
              background-color: #fffafb;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              text-align: center;
            }
            h1 {
              color: #28a745;
              margin-bottom: 20px;
            }
            p {
              color: #555;
              margin-bottom: 10px;
            }
            .verification-code {
              color: #28a745;
              padding: 10px 15px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 2.5rem;
              margin: 20px 0;
            }
            .contact-info {
              margin-top: 20px;
            }
            .team-signature {
              margin-top: 20px;
              color: #888;
            }
          </style>
        </head>
        <body>
  <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #e03d3d; border-top-left-radius: 8px; border-top-right-radius: 8px; height: 70px;">
              <table width="100%" height="70" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" valign="middle">
                    <img src="https://ticketplace.co/_next/image?url=%2Fgeneral%2FLogo.png&w=1920&q=75" alt="Ticket Place Logo" style="display: block; max-height: 60px;">
                  </td>
                </tr>
              </table>
            </div>
    <h1 style="color: #333;">
      <strong>Welcome to Ticket Place!</strong>
    </h1>
    <p>Hello there,</p>
    <p>Thanks for signing up!</p>
    <p>Please confirm your email address using the link below:</p>

    <button style="
      display: inline-block;
      background-color: #F34D49; /* orange */
      color: white;
      padding: 12px 24px;
      font-size: 16px;
      text-align: center;
      text-decoration: none;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
    ">
      <a href="${process.env.FE_URL}auth/verification?code=${verificationCode}&email=${user.email}" style="
        color: white;
        text-decoration: none;
        font-weight: bold;
        display: inline-block;
        width: 100%;
        height: 100%;
      ">
        Confirm Your Account
      </a>
    </button>

    <p style="margin-top: 20px;">Once your account is activated, you will be able to log in and create or buy tickets for your favorite event.</p>
    <p>If you did not sign up for this account, please ignore this email and contact our Support Team immediately.</p>
    <p class="contact-info">Best regards,<br>The Team</p>
    <p class="team-signature">Contact us at <a href="mailto:support@ticketplace.com" style="color: #F34D49; text-decoration: none;">support@ticketplace.com</a></p>
  </div>
</body>

        </html>`,
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeMail(user: User) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'Annexe@Annexe.co',
      to: user.email,
      subject: 'WELCOME TO Annexe',
      text: 'welcome',
      html: `<html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Annexe 🎉</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              width: 80%;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              text-align: center;
            }
            h1 {
              color: #28a745;
              margin-bottom: 20px;
            }
            p {
              color: #555;
              margin-bottom: 10px;
            }
            .verification-code {
              color: #28a745;
              padding: 10px 15px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 2.5rem;
              margin: 20px 0;
            }
            .contact-info {
              margin-top: 20px;
            }
            .team-signature {
              margin-top: 20px;
              color: #888;
            }
          </style>
        </head>
        <body>
        <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">
            <strong>Welcome to Ticket Place!</strong>
          </h1>
          <p>Hi ${user.firstName},</p>
          <p>We’re thrilled to have you on board! Your account has been successfully verified, and you’re now ready to explore all the amazing features we have to offer.          
          </p>
          <p>Click the button below to log in and start your journey with us:</p>
      
          <button style="
            display: inline-block;
            background-color: #F34D49; /* orange */
            color: white;
            padding: 12px 24px;
            font-size: 16px;
            text-align: center;
            text-decoration: none;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
          ">
            <a href="${process.env.FE_URL}login" style="
              color: white;
              text-decoration: none;
              font-weight: bold;
              display: inline-block;
              width: 100%;
              height: 100%;
            ">
            Login Now
            </a>
          </button>
      
          <p style="margin-top: 20px;">If you have any questions, feel free to reply to this email or contact our support team.

          <br>Welcome aboard! 🚀

          </p>
          <p class="team-signature">Contact us at <a href="mailto:support@Annexe.com" style="color: #F34D49; text-decoration: none;">support@Annexe.com</a></p>
        </div>
      </body>
      
        </html>`,
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendForgotPasswordEmail(user: User, resetToken: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'support@Annexe.co',
      to: user.email,
      subject: 'Reset Your Password',
      text: 'Password Reset Request',
      html: `<html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 80%;
          margin: 20px auto;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          text-align: center;
        }
        h1 {
          color: #F34D49;
          margin-bottom: 20px;
        }
        p {
          color: #555;
          margin-bottom: 10px;
        }
        .reset-token {
          color: #d9534f;
          padding: 10px 15px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 2rem;
          margin: 20px 0;
        }
        .contact-info {
          margin-top: 20px;
        }
        .team-signature {
          margin-top: 20px;
          color: #888;
        }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h1 style="color: #F34D49; text-align: center;">Password Reset Request</h1>
            
            <p>Hello ${user.firstName},</p>
            
            <p>We received a request to reset your password. If you requested this action, please use the link below to reset your password:</p>
            
            <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FE_URL}auth/reset-password?code=${resetToken}&email=${user.email}" style="
                display: inline-block;
                background-color: #F34D49;
                color: white;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                text-decoration: none;
                border-radius: 5px;
                cursor: pointer;
            ">
                Reset Your Password
            </a>
            </div>
            
            <p>This link is valid for 1 hour. Please complete the password reset process within this time frame.</p>
            
            <p>If you did not request a password reset, no further action is required. You may ignore this email, or if you have any concerns, please reach out to our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
            <p style="text-align: center;">Best regards,<br>The Annexe Team</p>
            <p style="text-align: center; color: #F34D49;">Contact us at <a href="mailto:support@Annexe.com" style="color: #F34D49; text-decoration: none;">support@Annexe.com</a></p>
        </div>
    </body>

    </html>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetSuccessEmail(user: User) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'support@Annexe.co',
      to: user.email,
      subject: 'Your Password Has Been Successfully Reset',
      text: 'Password Reset Successful',
      html: `<html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 80%;
          margin: 20px auto;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          text-align: center;
        }
        h1 {
          color: #28a745;
          margin-bottom: 20px;
        }
        p {
          color: #555;
          margin-bottom: 10px;
        }
        .contact-info {
          margin-top: 20px;
        }
        .team-signature {
          margin-top: 20px;
          color: #888;
        }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h1 style="color: #F34D49; text-align: center;">Password Reset Successful</h1>
            
            <p>Hello ${user.firstName},</p>
            
            <p>Your password for your account has been successfully reset. You can now log in using your new password.</p>
            
            <p>If you did not initiate this password reset, please contact our Support Team immediately to secure your account.</p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            
            <p style="text-align: center;">Best regards,<br>The EduArc4Life Team</p>
            
            <p style="text-align: center; color: #666;">Contact us at <a href="mailto:support@eduarc4life.com" style="color: #F34D49; text-decoration: none;">support@eduarc4life.com</a></p>
        </div>
    </body>

    </html>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendAuctionStartMail(user: User, auction: Auction) {
    console.log('things:==>', { user, auction });
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'Annexe@Annexe.co',
      to: user.email,
      subject: 'The Auction Has Begun! Place Your Bids Now 🏆',
      html: `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Auction Now Live – Place Your Bids!</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 80%;
        margin: 20px auto;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        text-align: center;
      }
      h1 {
        color: #F34D49;
        margin-bottom: 20px;
      }
      p {
        color: #555;
        margin-bottom: 10px;
        font-size: 16px;
      }
      .cta-button {
        display: inline-block;
        background-color: #F34D49;
        color: white;
        padding: 12px 24px;
        font-size: 16px;
        text-align: center;
        text-decoration: none;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 15px;
      }
      .cta-button a {
        color: white;
        text-decoration: none;
        font-weight: bold;
        display: inline-block;
        width: 100%;
        height: 100%;
      }
      .footer {
        margin-top: 20px;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🚨 The Auction is Now Live! 🚨</h1>
      <p>Hi ${user.firstName},</p>
      <p>The moment you've been waiting for is here! The auction for <strong>"${auction.productName}"</strong> has officially begun. Don't miss your chance to place a bid and own something truly special.</p>
      <p>Act fast – the auction closes on <strong>${format(auction.endDate, 'MMMM d, yyyy h:mm a')}</strong>!</p>

      <button class="cta-button">
        <a href="${process.env.FE_URL}/auction/${auction._id}">Place Your Bid Now</a>
      </button>

      <p class="footer">If you have any questions, feel free to reach out to our support team at 
      <a href="mailto:support@Annexe.com" style="color: #F34D49; text-decoration: none;">support@Annexe.com</a>.</p>
    </div>
  </body>
</html>
`, // Use the HTML template above
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Auction email sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending auction email:', error);
      throw new Error('Failed to send auction email');
    }
  }

  async sendAuctionEndedMail(user: User, auction: Auction) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'Annexe@Annexe.co',
      to: user.email,
      subject: `Auction Ended: ${auction.productName}`,
      html: `<html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Auction Ended – ${auction.productName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 80%;
          margin: 20px auto;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          text-align: center;
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        p {
          color: #555;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .highlight {
          font-weight: bold;
          color: #F34D49;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏁 Auction Ended</h1>
        <p>Hi ${user.firstName},</p>
        <p>The auction for <strong class="highlight">${auction.productName}</strong> has officially ended.</p>
        
        <p>Thank you for participating! We hope you enjoyed the thrill of the bid.</p>

<p>Unfortunately, your bid wasn’t the highest this time. But don’t worry — more exciting auctions are coming soon on Annexe, and your next winning bid could be just around the corner.</p>

<p>Stay tuned, and thank you for being part of the Annexe community!</p>

  
        <p class="footer">
          Have any questions? Contact our support team at 
          <a href="mailto:support@Annexe.com" style="color: #F34D49; text-decoration: none;">support@Annexe.com</a>
        </p>
      </div>
    </body>
  </html>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Auction ended email sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending auction ended email:', error);
      throw new Error('Failed to send auction ended email');
    }
  }

  async sendAuctionWinnerMail(auction: any) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'Annexe@Annexe.co',
      to: auction.winningBid.bidOwner.email,
      subject: `Congratulations! You've Won the Auction: ${auction.productName}`,
      html: `<html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Congratulations! You've Won – ${auction.productName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 80%;
          margin: 20px auto;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          text-align: center;
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        p {
          color: #555;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .highlight {
          font-weight: bold;
          color: #F34D49;
        }
        .warning {
          font-weight: bold;
          color: #FF8C00;
        }
        .details {
          background-color: #f9f9f9;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
          text-align: left;
        }
        .details p {
          margin: 5px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 25px;
          background-color: #F34D49;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .payment-info {
          background-color: #fff8e1;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
          border-left: 4px solid #FF8C00;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Congratulations!</h1>
        <p>Hi ${auction.winningBid.bidOwner.firstName},</p>
        <p>Great news! Your bid for <strong class="highlight">${auction.productName}</strong> was the highest.</p>
        
        <p>You've successfully won this auction with a winning bid of <strong class="highlight">NGN ${auction.winningBid.amount.toLocaleString()}</strong>.</p>
  
        <div class="details">
          <p><strong>Auction Details:</strong></p>
          <p>Item: ${auction.productName}</p>
          <p>Your Winning Bid: NGN ${auction.winningBid.amount.toLocaleString()}</p>
          <p>Auction Closed: ${format(auction.endDate, 'MMMM d, yyyy h:mm a')}</p>
        </div>
  
        <div class="payment-info">
          <p><strong>IMPORTANT: Payment Required Within 24 Hours</strong></p>
          <p>Please log in to your Annexe dashboard and click the "Pay Now" button to complete your purchase.</p>
          <p class="warning">⚠️ If payment is not received within 24 hours, your winning bid will become invalid and you may lose the item.</p>
        </div>
        
        <a href="https://annexe.co/dashboard/payments" class="button">Log In & Pay Now</a>
  
        <p>After your payment is confirmed, our team will contact you with shipping details.</p>
  
        <p>Thank you for participating in our auction platform. We hope you enjoy your new item!</p>
  
        <p class="footer">
          Have any questions? Contact our support team at 
          <a href="mailto:support@Annexe.com" style="color: #F34D49; text-decoration: none;">support@Annexe.com</a>
        </p>
      </div>
    </body>
  </html>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Auction winner email sent: %s', info.messageId);
    } catch (error) {
      console.error('Error sending auction winner email:', error);
      throw new Error('Failed to send auction winner email');
    }
  }
}
