import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendInviteEmail(email: string, tempPassword: string) {
  const html = `
    <h2>Welcome to Learning Platform</h2>
    <p>You have been invited to join our learning platform.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
    <p>Please log in and change your password on first login.</p>
    <a href="${process.env.NEXTAUTH_URL}/auth/login">Login Here</a>
  `
  
  return await sendEmail({
    to: email,
    subject: 'Welcome to Learning Platform',
    html,
  })
}