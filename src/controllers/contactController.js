const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send contact form email
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields',
      });
    }

    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Send to admin email
      replyTo: email, // Allow admin to reply directly to the sender
      subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>This message was sent from the contact form on Sasha Smiles website.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send a copy to the user
    if (email) {
      const userMailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Thank you for contacting Sasha Smiles',
        html: `
          <h2>Thank you for contacting Sasha Smiles!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and our team will get back to you shortly.</p>
          <p><strong>Your Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><strong>Contact Information:</strong></p>
          <p>Email: ${email}</p>
          ${phone ? `<p>Phone: ${phone}</p>` : ''}
          <hr>
          <p>Best regards,<br>Sasha Smiles Team</p>
        `,
      };

      await transporter.sendMail(userMailOptions).catch(console.error);
    }

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully!',
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message,
    });
  }
};

// Test email configuration
exports.testEmail = async (req, res) => {
  try {
    await transporter.verify();
    res.status(200).json({
      success: true,
      message: 'Email server is configured correctly',
    });
  } catch (error) {
    console.error('Email configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration error',
      error: error.message,
    });
  }
};
