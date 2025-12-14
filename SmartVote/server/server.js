const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Route to send admin registration confirmation email
app.post('/api/send-admin-confirmation', async (req, res) => {
  try {
    const { adminName, adminEmail, electionTitle, organizationName } = req.body;

    // Validate required fields
    if (!adminName || !adminEmail || !electionTitle || !organizationName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `Admin Registration Confirmation - ${electionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B298E7;">SmartVote Admin Registration Confirmation</h2>
          
          <p>Hello <strong>${adminName}</strong>,</p>
          
          <p>This email confirms that you have been successfully registered as an administrator for the following election:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${electionTitle}</h3>
            <p><strong>Organization:</strong> ${organizationName}</p>
          </div>
          
          <p>You can now access the admin dashboard to manage this election, including:</p>
          <ul>
            <li>Adding candidates</li>
            <li>Verifying voters</li>
            <li>Starting and ending the election</li>
            <li>Viewing real-time results</li>
          </ul>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <hr style="margin: 30px 0;">
          
          <p style="font-size: 12px; color: #777;">
            This is an automated message from SmartVote. Please do not reply to this email.
          </p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    res.status(200).json({ 
      success: true, 
      message: 'Confirmation email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send confirmation email' 
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;