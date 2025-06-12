import nodemailer from "nodemailer";
import pug from "pug";
import { htmlToText } from "html-to-text";

export default class Email {
  constructor(user, url = "") {
    this.to = user.email;
    this.firstName = user.fullName.split(" ").at(0);
    this.url = url;
    this.from = `Wrishita mal <${process.env.MAIL_FROM}>`;
  }

  mailTransPort() {
    if (process.env === "NODE_ENV") {
      // IMPLPLEMENT FOR SEND GRID
      return 0;
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async send(template, subject, productDetails = {}) {
    // 1. set the email template
    const html = pug.renderFile(
      `${__dirname}/../emailTemplates/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
        ...productDetails,
      }
    );
    const text = htmlToText(html);

    // 2. define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
      html,
    };

    // 3. craate a transport and send email

    await this.mailTransPort().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Vintage Vault family");
  }

  async auctionEndMail(productName, finalBid, productImage) {
    await this.send("auctionEnd", `Auction Ended: Here's the Final Update`, {
      productName,
      finalBid,
      productImage,
    });
  }
  async sendWinningMail(productName, finalBid, productImage) {
    await this.send("winner", `Congratulations! You’ve Won the Auction`, {
      productName,
      finalBid,
      productImage,
    });
  }
  async resetPassword() {
    await this.send("resetPassword", "Reset Your Password - Vintage Vault");
  }
}
