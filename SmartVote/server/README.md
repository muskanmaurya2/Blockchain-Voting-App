# SmartVote Backend Server

This is the backend server for the SmartVote decentralized voting application. It provides email notification services for admin registration confirmations.

## Features
- Email notifications for admin registration
- RESTful API for frontend integration
- Secure email delivery using Nodemailer

## Prerequisites
- Node.js (v14 or higher)
- Gmail account (for email notifications)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the server root with the following variables:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   PORT=5000
   ```

3. **Gmail App Password Setup**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password specifically for this application
   - Use the App Password in the `EMAIL_PASS` field (not your regular password)

4. **Start the Server**
   ```bash
   # Production mode
   npm start
   
   # Development mode (requires nodemon)
   npm install -g nodemon
   npm run dev
   ```

## API Endpoints

### Send Admin Confirmation Email
- **URL**: `/api/send-admin-confirmation`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "adminName": "John Doe",
    "adminEmail": "john.doe@example.com",
    "electionTitle": "School Election 2025",
    "organizationName": "Lifeline Academy"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Confirmation email sent successfully"
  }
  ```

## Security Notes
- Never commit `.env` files to version control
- Always use App Passwords for Gmail, not regular passwords
- Ensure proper firewall configuration in production

## Troubleshooting
- If emails aren't sending, check your Gmail security settings
- Ensure the App Password is correctly configured
- Check server logs for error messages