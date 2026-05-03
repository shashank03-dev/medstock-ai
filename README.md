# MedStock AI

A comprehensive medical inventory and stock management system powered by AI. MedStock AI helps healthcare facilities track, forecast, and optimize their medical supplies and inventory with intelligent analytics.

## 🚀 Features

- **Smart Inventory Management** - Real-time tracking of medical supplies and stock levels
- **AI-Powered Forecasting** - Predictive analytics for demand forecasting
- **Crisis Management** - Handle emergency requests and urgent supply needs
- **Expiry Tracking** - Monitor and manage expiring batches
- **Hospital Network** - Multi-hospital and department management
- **Dashboard Analytics** - Comprehensive dashboards with key metrics
- **Alerts System** - Real-time alerts for critical stock events
- **Onboarding** - Easy setup and hospital registration

## 📁 Project Structure

```
medstock/
├── artifacts/
│   ├── api-server/          # Express.js backend API
│   ├── medstock-ai/         # React frontend application
│   └── mockup-sandbox/      # UI mockup and preview components
├── lib/
│   ├── api-client-react/    # React API client library
│   ├── api-spec/            # OpenAPI specifications
│   ├── api-zod/             # Zod schema definitions
│   └── db/                  # Drizzle ORM database schemas
├── scripts/                 # Utility scripts
└── package.json             # Monorepo configuration
```

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** Drizzle ORM with structured schema
- **API:** OpenAPI/Swagger specifications, Zod validation
- **Package Manager:** pnpm (monorepo workspaces)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Install dependencies for specific workspace
pnpm install -w @medstock/api-server
pnpm install -w medstock-ai
```

### Development

```bash
# Start development servers
pnpm dev

# Build all packages
pnpm build

# Run type checking
pnpm type-check

# Lint and format
pnpm lint
```

## 📦 Core Packages

### API Server (`artifacts/api-server`)
REST API server handling:
- Hospital and department management
- Inventory tracking
- Stock movements and transactions
- Crisis requests and alerts
- Forecasting and analytics
- Expiry batch management

### Frontend (`artifacts/medstock-ai`)
Web application features:
- Dashboard with key metrics
- Inventory management interface
- Alert management system
- Crisis request handling
- Forecasting tools
- Hospital onboarding
- Settings and configuration

### Database (`lib/db`)
Schema definitions for:
- Hospitals and departments
- SKUs and inventory items
- Stock movements
- Expiry batches
- Forecasts
- Crisis requests
- Surplus listings
- Alerts

### API Client (`lib/api-client-react`)
Typed React hooks and utilities for API communication

## 📚 API Documentation

API specifications are defined in OpenAPI format at `lib/api-spec/openapi.yaml`. Generated client code and types are available in:
- `lib/api-client-react/src/generated/` - React hooks
- `lib/api-zod/src/generated/` - Zod schemas

## 🔌 Available Routes

Key API endpoints:
- `/health` - Health check
- `/hospitals` - Hospital management
- `/departments` - Department management
- `/inventory` - Inventory items and SKUs
- `/alerts` - Alert system
- `/crisis` - Crisis management
- `/forecasts` - Demand forecasting
- `/expiry` - Expiry batch tracking
- `/dashboard` - Analytics and metrics
- `/onboarding` - Hospital registration

## 📝 Development Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages
- `pnpm type-check` - TypeScript type checking
- `pnpm lint` - Lint code
- `pnpm format` - Format code

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Push and create a pull request

## 📄 License

This project is part of the MedStock initiative.

## 📧 Support

For issues, questions, or feature requests, please open an issue in the repository.
