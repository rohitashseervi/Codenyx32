const nodemailer = require('nodemailer');

// Initialize transporter with GapZero system Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'noreply@gapzero.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

/**
 * HTML email template builder
 */
function getEmailTemplate(title, content, ctaLink = null, ctaText = null) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .content { background: white; padding: 30px; margin: 0; }
        .content h2 { color: #667eea; margin-top: 0; }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .cta-button:hover { opacity: 0.9; }
        .footer {
          background: #f0f0f0;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-radius: 0 0 8px 8px;
        }
        .badge { background: #e3f2fd; color: #1976d2; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GapZero</h1>
          <p>${title}</p>
        </div>
        <div class="content">
          ${content}
          ${ctaLink ? `<a href="${ctaLink}" class="cta-button">${ctaText || 'View Details'}</a>` : ''}
        </div>
        <div class="footer">
          <p>GapZero Education Platform | Empowering Students, Supporting Mentors</p>
          <p>Questions? Contact us at support@gapzero.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send class invite to students
 */
async function sendClassInvite(studentEmails, meetLink, topic, date, volunteerName) {
  try {
    if (!Array.isArray(studentEmails)) {
      studentEmails = [studentEmails];
    }

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = `
      <h2>Class Invitation</h2>
      <p>You're invited to an upcoming class session!</p>
      <div style="background: #f0f7ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Instructor:</strong> ${volunteerName}</p>
      </div>
      <p>Click the button below to join the session:</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@gapzero.com',
      to: studentEmails.join(', '),
      subject: `Class Invitation: ${topic}`,
      html: getEmailTemplate('Class Invitation', htmlContent, meetLink, 'Join Class')
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: 'Class invite sent', result: result };
  } catch (error) {
    console.error('Error sending class invite:', error);
    throw new Error(`Failed to send class invite: ${error.message}`);
  }
}

/**
 * Send test notification to students
 */
async function sendTestNotification(studentEmails, testId, topic, deadline) {
  try {
    if (!Array.isArray(studentEmails)) {
      studentEmails = [studentEmails];
    }

    const deadlineDate = new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = `
      <h2>New Test Available</h2>
      <p>A new test on <strong>${topic}</strong> is now available for you to take.</p>
      <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
        <p><strong>Deadline:</strong> ${deadlineDate}</p>
        <p>Complete this test to assess your understanding and earn badges.</p>
      </div>
      <p>Log in to GapZero to take the test now!</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@gapzero.com',
      to: studentEmails.join(', '),
      subject: `Test Available: ${topic}`,
      html: getEmailTemplate('New Test', htmlContent)
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: 'Test notification sent', result: result };
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw new Error(`Failed to send test notification: ${error.message}`);
  }
}

/**
 * Send mentor alert about weak performance
 */
async function sendMentorAlert(mentorEmail, studentName, testScore, topic) {
  try {
    const performanceLevel = testScore >= 80 ? 'Good' : testScore >= 60 ? 'Needs Improvement' : 'Concerning';

    const htmlContent = `
      <h2>Student Performance Alert</h2>
      <p>One of your students needs your attention:</p>
      <div style="background: ${testScore < 60 ? '#ffebee' : '#fff3cd'}; padding: 15px; border-left: 4px solid ${testScore < 60 ? '#f44336' : '#ff9800'}; margin: 20px 0;">
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Test:</strong> ${topic}</p>
        <p><strong>Score:</strong> ${testScore}% <span class="badge">${performanceLevel}</span></p>
      </div>
      <p>Consider reaching out to discuss areas of improvement and provide additional support.</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@gapzero.com',
      to: mentorEmail,
      subject: `Alert: ${studentName}'s Performance in ${topic}`,
      html: getEmailTemplate('Performance Alert', htmlContent)
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: 'Mentor alert sent', result: result };
  } catch (error) {
    console.error('Error sending mentor alert:', error);
    throw new Error(`Failed to send mentor alert: ${error.message}`);
  }
}

/**
 * Send mentor assignment notification
 */
async function sendMentorAssignment(mentorEmail, studentName, matchScore) {
  try {
    const htmlContent = `
      <h2>New Student Assignment</h2>
      <p>You have been matched with a new student!</p>
      <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Match Score:</strong> ${matchScore}%</p>
        <p>This match is based on subject expertise, learning gaps, language compatibility, and behavioral profile alignment.</p>
      </div>
      <p>Log in to GapZero to view the student's profile and start your mentoring journey.</p>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@gapzero.com',
      to: mentorEmail,
      subject: `New Student Assignment: ${studentName}`,
      html: getEmailTemplate('Mentor Assignment', htmlContent)
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: 'Mentor assignment sent', result: result };
  } catch (error) {
    console.error('Error sending mentor assignment:', error);
    throw new Error(`Failed to send mentor assignment: ${error.message}`);
  }
}

/**
 * Send generic notification email
 */
async function sendGenericNotification(email, subject, htmlBody) {
  try {
    if (!Array.isArray(email)) {
      email = [email];
    }

    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@gapzero.com',
      to: email.join(', '),
      subject: subject,
      html: getEmailTemplate(subject, htmlBody)
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: 'Notification sent', result: result };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
}

module.exports = {
  sendClassInvite,
  sendTestNotification,
  sendMentorAlert,
  sendMentorAssignment,
  sendGenericNotification
};
