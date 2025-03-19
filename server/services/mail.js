import nodemailer from 'nodemailer'
import dotenv from "dotenv";

dotenv.config({
  path:'.env'
});




const sendMail = async (requestOption) => {

    const transporter = nodemailer.createTransport({
        service: process.env.NODEMAILER_SERVICE_PROVIDER, 
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });


    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: requestOption.to, 
        subject: requestOption.subject,
        text: requestOption.text,
        html: requestOption.html
      };
      
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
         throw new Error(error)
        } else {
          return info.rejected
        }
      });


}


export {sendMail}

