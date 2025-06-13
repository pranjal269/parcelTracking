# 📦 SmartTracking - Parcel Management System

A comprehensive parcel tracking and management system built with .NET Core and React, featuring real-time tracking, role-based access control, and modern UI design.

## 🚀 Features

### 🎯 Core Functionality
- **Real-time Parcel Tracking** - Track shipments with unique tracking IDs
- **QR Code Generation** - Auto-generated QR codes for each shipment
- **OTP Verification** - Secure delivery confirmation with OTP
- **Role-based Access** - Separate interfaces for Customers, Handlers, and Admins
- **Notification System** - Email and SMS notifications for shipment updates

### 👥 User Roles
- **Customers** - Create shipments, track packages, manage deliveries
- **Handlers** - Update shipment status, manage logistics
- **Admins** - Full system oversight, user management, analytics

### 🎨 UI/UX Features
- **Modern Glassmorphic Design** - Beautiful, contemporary interface
- **Responsive Design** - Works seamlessly on all devices
- **Dark/Light Mode** - User preference-based theming
- **Interactive Dashboards** - Real-time data visualization

## 🛠️ Tech Stack

### Backend (.NET Core)
- **Framework**: .NET 9.0
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: Role-based authentication
- **APIs**: RESTful API design
- **Notifications**: Email (MailKit) and SMS (Twilio) integration

### Frontend (React)
- **Framework**: React 18 with functional components
- **Styling**: Modern CSS with glassmorphic effects
- **Routing**: React Router for navigation
- **HTTP Client**: Axios for API communication
- **UI**: Custom components with modern design patterns

## 📋 Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) database
- [Git](https://git-scm.com/)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/devdattatalele/smarttrackinng.git
cd smarttrackinng
```

### 2. Backend Setup
```bash
cd WebApplication1

# Restore dependencies
dotnet restore

# Update database connection string in appsettings.json
# Add your PostgreSQL connection string

# Run database migrations
dotnet ef database update

# Start the backend server
dotnet run --urls="http://localhost:8080"
```

### 3. Frontend Setup
```bash
cd parcel-tracking-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 🔧 Configuration

### Database Connection
Update the connection string in `WebApplication1/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=smarttracking;Username=yourusername;Password=yourpassword"
  }
}
```

### Email Configuration
Configure email settings for notifications:
```json
{
  "EmailSettings": {
    "SmtpServer": "your-smtp-server",
    "Port": 587,
    "Username": "your-email@domain.com",
    "Password": "your-password"
  }
}
```

## 👤 Default User Credentials

### Admin Access
- **Email**: `admin@parcel.com`
- **Password**: `password123`

### Handler Access
- **Email**: `handler@parcel.com`
- **Password**: `password123`

### Regular User Access
- **Email**: `user@test.com`
- **Password**: `password123`

## 🗺️ API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/handler/login` - Handler login
- `POST /api/admin/login` - Admin login

### Shipments
- `GET /api/shipment/user/{userId}` - Get user shipments
- `POST /api/shipment` - Create new shipment
- `GET /api/shipment/tracking/{trackingId}` - Track shipment
- `POST /api/shipment/otp/{shipmentId}` - Generate delivery OTP

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/role` - Update user role

## 📱 Screenshots

*Screenshots and demo images will be added here*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Icons and emojis from various open-source projects
- Inspired by modern logistics and tracking solutions

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

