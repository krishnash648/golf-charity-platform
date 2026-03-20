# SaaS Backend API

A production-ready Node.js backend built with Express and MongoDB for SaaS web applications.

## Features

- ✅ User Authentication (JWT-based)
- ✅ Password Hashing with bcrypt
- ✅ MongoDB Integration with Mongoose
- ✅ Clean Architecture (MVC Pattern)
- ✅ Error Handling
- ✅ Environment Configuration
- ✅ CORS Support

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── userController.js    # User business logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   └── User.js              # User Mongoose model
├── routes/
│   └── userRoutes.js        # User API routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## Installation

1. Clone the repository and navigate to the backend folder
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/saas-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/users/register` | Register a new user | Public |
| POST | `/api/users/login` | Login user | Public |
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update user profile | Private |

### Utility Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |
| GET | `/api` | API information and endpoints |

## API Usage Examples

### Register a User

```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john@example.com",
      "subscriptionStatus": "inactive",
      "createdAt": "2023-09-01T12:00:00.000Z",
      "updatedAt": "2023-09-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get User Profile

```bash
GET /api/users/profile
Authorization: Bearer <your-jwt-token>
```

### Update User Profile

```bash
PUT /api/users/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "John Smith",
  "subscriptionStatus": "active"
}
```

## User Model

The User model includes the following fields:

- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `password` (String, required): Hashed password
- `subscriptionStatus` (String, default: 'inactive'): User's subscription status
  - Possible values: 'active', 'inactive', 'trial', 'expired'
- `createdAt` (Date): Automatically created timestamp
- `updatedAt` (Date): Automatically updated timestamp

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in to receive a JWT token
2. Include the token in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your-jwt-token>
   ```
3. Tokens expire after the configured time (default: 7 days)

## Error Handling

The API includes comprehensive error handling:

- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Server errors (500)

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Database

The application uses MongoDB with Mongoose ODM. Make sure MongoDB is running locally or update the `MONGODB_URI` in your `.env` file.

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)
- Environment variable protection

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong `JWT_SECRET`
3. Configure proper MongoDB connection string
4. Set up proper CORS origin
5. Use HTTPS in production
6. Consider adding rate limiting and logging

## Contributing

1. Follow the existing code structure
2. Add comments to complex logic
3. Test your changes
4. Update documentation as needed

## License

ISC
