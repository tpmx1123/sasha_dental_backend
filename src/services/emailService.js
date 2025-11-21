const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Get email credentials (support both EMAIL_PASSWORD and EMAIL_PASS for compatibility)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    
    // Validate credentials
    if (!emailUser || !emailPass) {
      console.warn('⚠️  Email credentials not configured. Email functionality will not work.');
      console.warn('   Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
      return;
    }

    // Create transporter based on environment
    if (process.env.EMAIL_SERVICE === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    } else {
      // Generic SMTP configuration (defaults to Gmail SMTP)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }
  }

  async sendAppointmentConfirmation(appointment) {
    // Check if transporter is initialized
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    try {
      const formattedDate = new Date(appointment.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sasha Smiles'}" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: `Appointment Confirmation - ${appointment.appointmentNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #A1D6FA 0%, #C9E8FB 52%, #EFF8FB 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; color: #0067AC; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 30px; background: #FF642F; color: white; text-decoration: none; border-radius: 25px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #0067AC; margin: 0;">Sasha Smiles</h1>
                <p style="color: #737B8C; margin: 10px 0 0 0;">Appointment Confirmation</p>
              </div>
              <div class="content">
                <h2 style="color: #0067AC;">Hello ${appointment.fullName},</h2>
                <p>Thank you for booking an appointment with us! Your appointment has been confirmed.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #0067AC;">Appointment Details</h3>
                  <div class="info-row">
                    <span class="label">Appointment Number:</span> ${appointment.appointmentNumber}
                  </div>
                  <div class="info-row">
                    <span class="label">Name:</span> ${appointment.fullName}
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span> ${appointment.email}
                  </div>
                  <div class="info-row">
                    <span class="label">Phone:</span> ${appointment.phone}
                  </div>
                  <div class="info-row">
                    <span class="label">Preferred Date:</span> ${formattedDate}
                  </div>
                  ${appointment.message ? `
                  <div class="info-row">
                    <span class="label">Message:</span><br>
                    ${appointment.message}
                  </div>
                  ` : ''}
                </div>

                <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Confirmed</span></p>
                <p>We look forward to seeing you on ${formattedDate}. Please arrive 10 minutes before your scheduled appointment time. If you have any questions or need to make changes, please don't hesitate to contact us.</p>
                
                <p style="margin-top: 30px;">Best regards,<br>
                <strong>The Sasha Smiles Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Sasha Smiles. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${appointment.fullName},
          
          Thank you for booking an appointment with us! Your appointment has been confirmed.
          
          Appointment Details:
          - Appointment Number: ${appointment.appointmentNumber}
          - Name: ${appointment.fullName}
          - Email: ${appointment.email}
          - Phone: ${appointment.phone}
          - Preferred Date: ${formattedDate}
          ${appointment.message ? `- Message: ${appointment.message}` : ''}
          
          Status: Confirmed
          
          We look forward to seeing you on ${formattedDate}. Please arrive 10 minutes before your scheduled appointment time.
          
          Best regards,
          The Sasha Smiles Team
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Appointment confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending appointment confirmation email:', error);
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
  }

  async sendAdminNotification(appointment) {
    // Check if transporter is initialized
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      const formattedDate = new Date(appointment.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sasha Smiles'}" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Appointment Request - ${appointment.appointmentNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0067AC; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; color: #0067AC; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Appointment Request</h1>
              </div>
              <div class="content">
                <h2 style="color: #0067AC;">Appointment Details</h2>
                
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">Appointment Number:</span> ${appointment.appointmentNumber}
                  </div>
                  <div class="info-row">
                    <span class="label">Full Name:</span> ${appointment.fullName}
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span> ${appointment.email}
                  </div>
                  <div class="info-row">
                    <span class="label">Phone:</span> ${appointment.phone}
                  </div>
                  <div class="info-row">
                    <span class="label">Preferred Date:</span> ${formattedDate}
                  </div>
                  ${appointment.message ? `
                  <div class="info-row">
                    <span class="label">Message:</span><br>
                    ${appointment.message}
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Submitted:</span> ${new Date(appointment.createdAt).toLocaleString()}
                  </div>
                </div>

                <p style="color: #FF642F; font-weight: bold;">Action Required: Please review and confirm this appointment.</p>
              </div>
              <div class="footer">
                <p>This is an automated notification from the appointment system.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          New Appointment Request
          
          Appointment Number: ${appointment.appointmentNumber}
          Full Name: ${appointment.fullName}
          Email: ${appointment.email}
          Phone: ${appointment.phone}
          Preferred Date: ${formattedDate}
          ${appointment.message ? `Message: ${appointment.message}` : ''}
          Submitted: ${new Date(appointment.createdAt).toLocaleString()}
          
          Action Required: Please review and confirm this appointment.
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Admin notification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending admin notification email:', error);
      throw new Error(`Failed to send admin notification: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(user, resetUrl, resetToken) {
    // Check if transporter is initialized
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sasha Smiles'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request - Sasha Smiles Dashboard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #A1D6FA 0%, #C9E8FB 52%, #EFF8FB 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .button { display: inline-block; padding: 12px 30px; background: #FF642F; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
              .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0067AC; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
              .warning { color: #FF642F; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #0067AC; margin: 0;">Sasha Smiles</h1>
                <p style="color: #737B8C; margin: 10px 0 0 0;">Password Reset Request</p>
              </div>
              <div class="content">
                <h2 style="color: #0067AC;">Hello ${user.name},</h2>
                <p>You requested to reset your password for the Sasha Smiles Admin Dashboard.</p>
                
                <div class="info-box">
                  <p style="margin: 0;"><strong>Click the button below to reset your password:</strong></p>
                </div>

                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #0067AC;">${resetUrl}</p>

                <div class="info-box">
                  <p class="warning" style="margin: 0;">⚠️ This link will expire in 15 minutes.</p>
                  <p style="margin: 10px 0 0 0;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
                </div>

                <p style="margin-top: 30px;">Best regards,<br>
                <strong>The Sasha Smiles Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Sasha Smiles. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${user.name},
          
          You requested to reset your password for the Sasha Smiles Admin Dashboard.
          
          Click the link below to reset your password:
          ${resetUrl}
          
          This link will expire in 15 minutes.
          
          If you did not request this password reset, please ignore this email.
          
          Best regards,
          The Sasha Smiles Team
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendStatusUpdateEmail(appointment, newStatus) {
    // Check if transporter is initialized
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    try {
      const formattedDate = new Date(appointment.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const formattedTime = new Date(appointment.preferredDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Status-specific content
      let statusInfo = {};
      switch (newStatus) {
        case 'confirmed':
          statusInfo = {
            title: 'Appointment Confirmed',
            heading: 'Your Appointment Has Been Confirmed!',
            message: 'Great news! Your appointment has been confirmed. We look forward to seeing you.',
            color: '#10b981', // Green
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800'
          };
          break;
        case 'cancelled':
          statusInfo = {
            title: 'Appointment Cancelled',
            heading: 'Appointment Cancellation Notice',
            message: 'Your appointment has been cancelled. If you need to reschedule, please contact us.',
            color: '#ef4444', // Red
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800'
          };
          break;
        case 'completed':
          statusInfo = {
            title: 'Appointment Completed',
            heading: 'Thank You for Visiting Sasha Smiles!',
            message: 'Your appointment has been marked as completed. We hope you had a great experience with us.',
            color: '#3b82f6', // Blue
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800'
          };
          break;
        default:
          return { success: false, message: 'Invalid status for email notification' };
      }

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sasha Smiles'}" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: `${statusInfo.title} - ${appointment.appointmentNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #A1D6FA 0%, #C9E8FB 52%, #EFF8FB 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .status-box { background: ${statusInfo.bgColor}; border: 2px solid ${statusInfo.color}; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
              .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0067AC; }
              .info-row { margin: 10px 0; }
              .label { font-weight: bold; color: #0067AC; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #0067AC; margin: 0;">Sasha Smiles</h1>
                <p style="color: #737B8C; margin: 10px 0 0 0;">${statusInfo.title}</p>
              </div>
              <div class="content">
                <h2 style="color: #0067AC;">Hello ${appointment.fullName},</h2>
                <p>${statusInfo.message}</p>
                
                <div class="status-box" style="background: ${statusInfo.bgColor}; border-color: ${statusInfo.color};">
                  <h3 style="margin: 0; color: ${statusInfo.color}; font-size: 24px;">${statusInfo.heading}</h3>
                  <p style="margin: 10px 0 0 0; color: ${statusInfo.color}; font-weight: bold;">Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #0067AC;">Appointment Details</h3>
                  <div class="info-row">
                    <span class="label">Appointment Number:</span> ${appointment.appointmentNumber}
                  </div>
                  <div class="info-row">
                    <span class="label">Name:</span> ${appointment.fullName}
                  </div>
                  <div class="info-row">
                    <span class="label">Date:</span> ${formattedDate}
                  </div>
                  <div class="info-row">
                    <span class="label">Time:</span> ${formattedTime}
                  </div>
                  ${appointment.message ? `
                  <div class="info-row">
                    <span class="label">Your Message:</span><br>
                    ${appointment.message}
                  </div>
                  ` : ''}
                </div>

                ${newStatus === 'confirmed' ? `
                <p><strong>Important:</strong> Please arrive 10 minutes before your scheduled appointment time.</p>
                <p>If you need to reschedule or have any questions, please contact us at your earliest convenience.</p>
                ` : ''}

                ${newStatus === 'cancelled' ? `
                <p>If you would like to reschedule, please book a new appointment through our website or contact us directly.</p>
                ` : ''}

                <p style="margin-top: 30px;">Best regards,<br>
                <strong>The Sasha Smiles Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; ${new Date().getFullYear()} Sasha Smiles. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hello ${appointment.fullName},
          
          ${statusInfo.message}
          
          Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
          
          Appointment Details:
          - Appointment Number: ${appointment.appointmentNumber}
          - Name: ${appointment.fullName}
          - Date: ${formattedDate}
          - Time: ${formattedTime}
          ${appointment.message ? `- Your Message: ${appointment.message}` : ''}
          
          ${newStatus === 'confirmed' ? 'Please arrive 10 minutes before your scheduled appointment time.' : ''}
          
          Best regards,
          The Sasha Smiles Team
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Status update email sent (${newStatus}):`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Error sending status update email (${newStatus}):`, error);
      throw new Error(`Failed to send status update email: ${error.message}`);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

