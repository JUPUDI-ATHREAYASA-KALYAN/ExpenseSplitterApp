# Expense Splitter App

The Expense Splitter App is a comprehensive web application designed to help users track and split expenses among friends, roommates, or groups. It simplifies the process of tracking who owes who and settling group expenses.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Group Management**: Create groups, add members, and manage group settings
- **Expense Tracking**: Record expenses within groups and specify who paid and how it's split
- **Expense Settlement**: Settle debts between group members
- **Balance Summary**: View a summary of balances between group members
- **Notification System**: Get notified about new expenses and settlements

## Tech Stack

### Frontend
- React.js (with React Router, Redux Toolkit)
- Bootstrap for responsive design
- Axios for API communication
- Formik for form handling
- React Toastify for notifications

### Backend
- ASP.NET Core 6.0 API
- Entity Framework Core for data access
- SQL Server database
- JWT for authentication
- Swagger for API documentation

## Project Structure

```
/FullStackApp
├── /client                  # React Frontend
│   ├── /public
│   ├── /src
│   │   ├── /components      # Reusable components
│   │   ├── /pages           # Page components
│   │   ├── /services        # API service classes
│   │   ├── /store           # Redux store setup with slices
│   │   ├── App.js           # Main component with routes
│   │   ├── index.js         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── ...
├── /server                  # ASP.NET Core Backend
│   ├── /Controllers         # API controllers
│   ├── /Data                # Database context and migrations
│   ├── /DTOs                # Data Transfer Objects
│   ├── /Models              # Domain models
│   ├── /Services            # Business logic services
│   ├── Program.cs           # Application setup
│   ├── appsettings.json     # Application configuration
│   └── FullStackApp.csproj  # Project file
├── /database                # Database scripts and migrations
├── README.md                # Project documentation
└── .gitignore              
```

## Setup Instructions

### Prerequisites
- Node.js and npm
- .NET 6.0 SDK
- SQL Server

### Frontend Setup
1. Navigate to the client folder:
   ```
   cd FullStackApp/client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following content:
   ```
   REACT_APP_API_URL=https://localhost:7156/api
   ```
4. Start the development server:
   ```
   npm start
   ```

### Backend Setup
1. Navigate to the server folder:
   ```
   cd FullStackApp/server
   ```
2. Update the connection string in `appsettings.json` to match your SQL Server setup
3. Apply database migrations:
   ```
   dotnet ef database update
   ```
4. Run the application:
   ```
   dotnet run
   ```

## API Endpoints

### Authentication
- `POST /api/Auth/register` - Register a new user
- `POST /api/Auth/login` - Login and get JWT token

### Groups
- `GET /api/Group` - Get all groups for current user
- `GET /api/Group/{id}` - Get group details
- `POST /api/Group` - Create a new group
- `POST /api/Group/{id}/invite` - Invite a user to a group
- `POST /api/Group/invitations/{id}/accept` - Accept a group invitation
- `POST /api/Group/invitations/{id}/reject` - Reject a group invitation
- `GET /api/Group/invitations` - Get all pending invitations
- `DELETE /api/Group/{id}` - Delete a group
- `DELETE /api/Group/{id}/leave` - Leave a group

### Expenses
- `GET /api/Expense/group/{groupId}` - Get all expenses for a group
- `GET /api/Expense/{id}` - Get expense details
- `POST /api/Expense` - Create a new expense
- `POST /api/Expense/{id}/settle` - Settle an expense
- `GET /api/Expense/group/{groupId}/balances` - Get balances for a group
- `DELETE /api/Expense/{id}` - Delete an expense

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
