import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
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

export async function sendInviteEmail(
  email: string, 
  tempPassword: string, 
  name: string, 
  courses: Array<{ title: string; instructor: { name: string } }> = []
) {
  const coursesHtml = courses.length > 0 
    ? `
      <h3>Allocated Courses:</h3>
      <ul>
        ${courses.map(course => `
          <li><strong>${course.title}</strong> - Instructor: ${course.instructor.name}</li>
        `).join('')}
      </ul>
    `
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Learning Platform</h2>
      <p>Hi ${name},</p>
      <p>You have been invited to join our learning platform as a student.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Login Credentials:</strong></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
      </div>
      
      ${coursesHtml}
      
      <p>Please log in and change your password on first login for security.</p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/auth/login" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Login to Platform
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact your administrator.</p>
    </div>
  `
  
  return await sendEmail({
    to: email,
    subject: `Welcome to Learning Platform${courses.length > 0 ? ' - Course Access Granted' : ''}`,
    html,
  })
}