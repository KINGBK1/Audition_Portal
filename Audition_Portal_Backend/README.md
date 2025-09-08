---
title: Audition Portal Backend
---

## Setup Instructions

### Prerequisites

1. **Node Version Manager (NVM)**:
   - Install NVM to manage Node.js versions.
     ```
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
     ```
   - Verify the installation by restarting your terminal and checking with `nvm --version`.

2. **Node.js v20**:
   - Once NVM is installed, use it to install and switch to Node.js version 20.
     ```
     nvm install v20
     nvm use v20
     ```
   - Verify the Node.js version with `node -v`.

### Project Setup

1. **Clone the Repository**:
   ```
   git clone <repository_url>
   cd Audition_Portal_Backend
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Environment Variables**:
   - Create a `.env` file in the root directory of the project.
   - Add necessary environment variables like database URL, API keys, etc. Refer to `.env.example` for required variables.

4. **Database Setup**:
   - Ensure PostgreSQL is installed and running.
   - Update `DATABASE_URL` in `.env` with your database connection string.

5. **Run Migrations**:
   - Execute database migrations to create tables and schema.
     ```
     npx prisma migrate dev
     ```

6. **Start the Server**:
   ```
   npm run dev
   ```
   This will start the server in development mode.

### Usage

- Once the server is running, you can access endpoints defined in the backend API.
- Use tools like Postman or curl to test API endpoints.
- Ensure proper error handling and logging are configured for production use.

### Additional Notes

- Update and maintain this README with any changes to setup instructions or project details.
- Document API endpoints, data models, and any custom configurations as necessary.
- Ensure adherence to best practices for security, performance, and maintainability in backend development.

By following these steps, you should have the Audition Portal Backend up and running locally, ready for development or testing.
