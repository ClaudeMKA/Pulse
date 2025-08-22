import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEventReminder = async (
  to: string,
  eventTitle: string,
  artistName: string,
  location: string,
  timeUntil: string
) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@pulse.com",
    to,
    subject: `🎵 Rappel : ${eventTitle} dans ${timeUntil}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">�� Rappel Événement</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">${eventTitle}</h3>
          <p style="color: #6b7280; margin: 8px 0;">
            <strong>Artiste :</strong> ${artistName}
          </p>
          <p style="color: #6b7280; margin: 8px 0;">
            <strong>Lieu :</strong> ${location}
          </p>
          <p style="color: #6b7280; margin: 8px 0;">
            <strong>Rappel :</strong> L'événement commence dans ${timeUntil}
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          Merci de votre intérêt pour nos événements !
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};