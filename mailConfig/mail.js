
const { transporter } = require("./mailConfig.js");
const { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE } = require("./mailTemplate.js");

const sendEmail = async (email, subject, html) => {
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address");
  }

  // const recipient = [{ email }];

  try {
    const response = await transporter.sendMail({
      from: 'onboarding@resend.dev',
      to: email,
      subject,
      html,
      // category: "Email Verification",
    });

    console.log("Verification email sent successfully", response);
    return response;
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw error;
  }
};

// Function to send Reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetURL = `http://localhost:5173/reset-password?token=${resetToken}`;
  console.log(resetURL,"resetURL")
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);
  await sendEmail(email, "Password Reset Request", html);
};

// Function to send verification email
const sendVerificationEmail = async (email, verificationCode) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationCode);
  console.log(verificationCode);
  await sendEmail(email, "Verify Your Email", html);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
