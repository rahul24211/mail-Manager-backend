import transporter from "../config/mail.js";

const sendOtp = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Email Verification OTP",
    html: `
        <h2>Email Verification</h2>
        <p>Your OTP Is :</p>
        <h1>${otp}</h1>
        <p>This OTP Expire In 10 Minits</p>
        `,
  });
};

export default sendOtp;
