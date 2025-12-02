# CarAllocateFlow - Fleet Management System

A modern, comprehensive fleet management application designed for the Moroccan context. Streamline your vehicle allocation, track assignments, and manage your fleet efficiently.

## 🚀 Features

- **Dashboard Overview**: Real-time statistics on fleet status, active assignments, and vehicle availability.
- **Vehicle Management**: 
  - Add and track vehicles with detailed information (Make, Model, License Plate, Location).
  - Filter vehicles by status (Available, Assigned, Maintenance).
  - Moroccan license plate format support.
- **Client Management**:
  - Manage client profiles with CIN (ID card) integration.
  - **CIN File Upload**: Upload and preview CIN images directly.
  - Moroccan city selection and phone number formatting.
- **Assignment System**:
  - Step-by-step wizard for assigning vehicles to clients.
  - **Calendar View**: Visual timeline of all assignments with day/week/month views.
  - Status tracking (Active, Completed, Cancelled).
- **Localization**: tailored for Morocco with local cities, currency, and formats.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## 📦 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CarAllocateFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/car_allocate_flow
   ```

4. **Database Setup**
   Push the schema to your database:
   ```bash
   npm run db:push
   ```

5. **Run the Application**
   Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5000`.

## 🧹 Database Maintenance

To clear all data (useful for testing):
```bash
npx tsx scripts/clean-db.ts
```

## 📝 License

This project is proprietary software. All rights reserved.
