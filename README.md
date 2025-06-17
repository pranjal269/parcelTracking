# 📦 SmartTracking - Advanced Parcel Management System

A comprehensive parcel tracking and management system built with .NET Core and React, featuring **enterprise-grade tamper detection**, real-time tracking, role-based access control, and modern UI design.

## 🚀 Key Features

### 🔒 **NEW: Advanced Tamper Detection System**
- **Workflow Violation Detection** - Automatically detects when handlers skip required steps
- **Tampered Delivery Support** - Allows delivery of tampered packages with proper tracking
- **Complete Audit Trail** - Full traceability of who, what, when, and why for all tamper events
- **Visual Indicators** - Color-coded UI showing tamper status and delivery concerns
- **Statistics Dashboard** - Real-time tamper rate monitoring and analytics

### 📱 **NEW: Enhanced OTP Verification System**
- **Recipient Phone Verification** - OTP sent directly to recipient's phone number
- **Secure Handler Interface** - OTPs are never displayed to handlers for enhanced security
- **Universal Verification** - All deliveries, including tampered packages, require OTP verification
- **SMS Integration** - Real-time OTP delivery via SMS using Twilio
- **Audit Trail** - Complete tracking of OTP generation and verification events

### 🎯 Core Functionality
- **Real-time Parcel Tracking** - Track shipments with unique tracking IDs
- **QR Code Generation** - Auto-generated QR codes for each shipment
- **OTP Verification** - Secure delivery confirmation with OTP
- **Role-based Access** - Separate interfaces for Customers, Handlers, and Admins
- **Notification System** - Email and SMS notifications for shipment updates
- **Force Delivery** - Emergency delivery options for tampered packages

### 👥 User Roles

#### **Customers**
- Create shipments and track packages
- Receive tamper alerts for their deliveries
- Manage delivery preferences and addresses

#### **Handlers** 
- Update shipment status with workflow validation
- Deliver tampered packages with proper documentation
- Access tamper detection statistics and reports
- Force deliver packages in emergency situations
- Generate and verify OTPs for secure package delivery
- Secure delivery process with recipient-only OTP verification

#### **Admins**
- Full system oversight and user management
- Advanced analytics including tamper rate monitoring
- Complete audit trail access for all shipments

### 🎨 UI/UX Features
- **Modern Glassmorphic Design** - Beautiful, contemporary interface
- **Responsive Design** - Works seamlessly on all devices
- **Color-coded Status System** - Red (tampered), Orange (tampered delivery), Green (normal)
- **Interactive Dashboards** - Real-time data visualization with tamper metrics
- **Smart Filtering** - Filter by status, tamper status, and delivery type

## 🛠️ Tech Stack

### Backend (.NET Core 9.0)
- **Framework**: ASP.NET Core with Entity Framework Core
- **Database**: PostgreSQL with comprehensive audit logging
- **Authentication**: Role-based JWT authentication
- **APIs**: RESTful API with tamper detection endpoints
- **Security**: Enterprise-grade tamper detection and validation
- **Notifications**: Email (MailKit) and SMS (Twilio) integration

### Frontend (React 18)
- **Framework**: React with functional components and hooks
- **Styling**: Modern CSS with glassmorphic effects and tamper indicators
- **Routing**: React Router for secure navigation
- **HTTP Client**: Axios for API communication
- **UI Components**: Custom components with tamper detection visuals

## 📋 Prerequisites

- .NET 9.0 SDK
- Node.js (v16 or higher)
- PostgreSQL database
- Git

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/pranjal269/parcelTracking.git
cd parcelTracking
```

### 2. Backend Setup
```bash
cd WebApplication1

# Restore dependencies
dotnet restore

# Update database connection string in appsettings.json
# Add your PostgreSQL connection string

# Run database migrations (includes tamper detection schema)
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

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

## 🔧 Configuration

### Database Connection
Update the connection string in `WebApplication1/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=parcel_tracker;Username=yourusername;Password=yourpassword"
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
- **Access**: Full system control, tamper analytics, user management

### Handler Access
- **Email**: `handler@parcel.com`
- **Password**: `password123`
- **Access**: Shipment management, tamper detection, forced deliveries

### Regular User Access
- **Email**: `user@test.com`
- **Password**: `password123`
- **Access**: Create shipments, track packages, view tamper alerts

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
- `GET /api/shipment/otp/list` - List delivery OTPs (admin/debugging)

### **NEW: OTP Verification Endpoints**
- `POST /api/handler/shipments/{id}/generate-otp` - Generate OTP for recipient verification
- `POST /api/handler/shipments/{id}/verify-otp` - Verify OTP and mark as delivered
- `PUT /api/handler/shipments/{id}/force-deliver` - Force deliver with OTP verification

### **NEW: Tamper Detection Endpoints**
- `GET /api/handler/statistics` - Get tamper detection statistics
- `GET /api/handler/shipments/tampered` - Get only tampered shipments
- `PUT /api/handler/shipments/{id}/status` - Update status with tamper validation
- `PUT /api/handler/shipments/{id}/deliver` - Smart delivery (handles tampered packages)
- `POST /api/handler/shipments/{id}/mark-tampered` - Manually mark as tampered
- `GET /api/handler/workflow-steps` - Get valid workflow steps

### Admin
- `GET /api/admin/dashboard` - Admin dashboard with tamper metrics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/role` - Update user role

## 🔒 Tamper Detection System

### Workflow Validation
The system enforces proper workflow sequence:
```
Pending → Picked Up → In Transit → Out for Delivery → Delivered
```

### Tamper Detection Features
1. **Automatic Detection** - Catches workflow violations (e.g., Pending → Delivered)
2. **Handler Attribution** - Records who attempted invalid transitions
3. **Timestamp Precision** - Exact violation detection times
4. **Detailed Reasons** - Explains what steps were skipped
5. **Force Delivery** - Allows emergency delivery of tampered packages

### Tampered Delivery Statuses
- **`Delivered`** - Normal successful delivery
- **`Delivered_Tampered`** - Package delivered despite tampering concerns
- **Visual Indicators** - Orange badges for tampered deliveries

## 📱 OTP Verification System

### Security Features
1. **Recipient-Only OTP** - OTPs are sent directly to the recipient's phone number
2. **Handler Privacy** - OTPs are never displayed to handlers for enhanced security
3. **Universal Verification** - All deliveries, including tampered packages, require OTP verification
4. **SMS Integration** - Real-time OTP delivery via Twilio SMS service
5. **Audit Trail** - Complete tracking of OTP generation and verification events

### OTP Workflow
```
Generate OTP → Send to Recipient → Recipient Provides OTP to Handler → Handler Verifies → Package Delivered
```

### Enhanced Security
- **Tampered Package Protection** - Even tampered packages require OTP verification
- **Delivery Confirmation** - Ensures the right person receives the package
- **Secure Communication** - Direct SMS to recipient bypasses handler involvement
- **Verification Tracking** - Complete record of OTP generation and verification

## 📊 Dashboard Features

### Handler Dashboard
- **Tamper Statistics** - Real-time tamper rate monitoring
- **Dual Filtering** - Filter by status and tamper status
- **Workflow Guidance** - Visual workflow steps with violation warnings
- **Smart Actions** - Context-aware buttons for tampered packages
- **Force Delivery** - Emergency delivery options with confirmations
- **OTP Management** - Generate and verify OTPs for secure delivery

### Admin Dashboard  
- **System Analytics** - Comprehensive tamper rate analytics
- **User Management** - Role-based access control
- **Audit Trails** - Complete tamper event logging
- **Performance Metrics** - Delivery efficiency and quality metrics
- **OTP Monitoring** - Track OTP generation and verification events

## 🎯 Business Impact

### Operational Benefits
- **Reduced Package Loss** - Tampered packages can still be delivered
- **Complete Traceability** - Full audit trail for compliance
- **Risk Management** - Clear documentation for liability protection
- **Quality Control** - Separate tracking of delivery concerns
- **Handler Efficiency** - Clear options for problem packages
- **Delivery Confirmation** - Ensures packages are delivered to intended recipients

### Security Features
- **Immutable Records** - Tamper events cannot be deleted
- **Handler Attribution** - Complete accountability chain
- **Workflow Enforcement** - Prevents unauthorized status changes
- **Emergency Override** - Controlled violation of business rules
- **Recipient Verification** - OTP verification prevents delivery to wrong recipients
- **Secure Communication** - OTPs sent directly to recipient phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Enterprise-grade tamper detection and OTP verification systems
- Inspired by modern logistics and security solutions
- Icons and UI elements from various open-source projects

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

## 🚀 Recent Updates

### v2.1 - Enhanced OTP Verification System
- ✅ **Recipient Phone Verification** - OTP sent directly to recipient's phone number
- ✅ **Secure Handler Interface** - OTPs are never displayed to handlers
- ✅ **Universal Verification** - All deliveries, including tampered packages, require OTP verification
- ✅ **SMS Integration** - Real-time OTP delivery via Twilio
- ✅ **Audit Trail** - Complete tracking of OTP generation and verification events

### v2.0 - Tamper Detection System
- ✅ **Enterprise Tamper Detection** - Automatic workflow violation detection
- ✅ **Tampered Delivery Support** - Deliver packages despite tampering concerns  
- ✅ **Advanced Analytics** - Real-time tamper rate monitoring
- ✅ **Visual Indicators** - Color-coded tamper status system
- ✅ **Complete Audit Trail** - Full traceability and compliance
- ✅ **Force Delivery Options** - Emergency delivery capabilities

---

**🎉 Ready for Enterprise Deployment with Advanced Security Features!**