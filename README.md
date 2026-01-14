# Vendor Payment Tracking System

A backend API system for managing vendor payments, purchase orders, and payment tracking for MSMEs built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Live Demo

- **API Base URL**: `https://your-deployed-url.com`
- **Swagger Docs**: `https://your-deployed-url.com/api`
- **Docker Image**: `ramanand8/qistonpe-api:latest`

## 🔐 Authentication Credentials

```
Username: admin
Password: admin123
```

> All endpoints except `/auth/login` are JWT protected. Login first to get a token.

## Tech Stack

- **Framework**: NestJS v11
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: JWT (Passport)
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm
- PostgreSQL database (Supabase recommended)
- Docker (optional)

### Local Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Update DATABASE_URL and JWT_SECRET in .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database with sample data
npx prisma db seed

# Start development server
npm run start:dev
```

### Docker Installation

```bash
# Build and run with Docker Compose
docker compose up --build

# Or pull from Docker Hub
docker pull ramanand8/qistonpe-api:latest
docker run -p 3000:3000 --env-file .env ramanand8/qistonpe-api:latest
```

### Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
JWT_SECRET="super-secret-key"
PORT=3000
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Access Swagger documentation at: http://localhost:3000/api

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Vendor     │ 1──* │  PurchaseOrder   │ 1──* │   Payment    │
├──────────────┤      ├──────────────────┤      ├──────────────┤
│ id (PK)      │      │ id (PK)          │      │ id (PK)      │
│ name (unique)│      │ poNumber (unique)│      │ paymentRef   │
│ contactPerson│      │ vendorId (FK)    │      │ poId (FK)    │
│ email(unique)│      │ date             │      │ date         │
│ phone        │      │ totalAmount      │      │ amount       │
│ paymentTerms │      │ paymentDueDate   │      │ method       │
│ status       │      │ status           │      │ notes        │
│ createdAt    │      │ items (JSON)     │      │ createdAt    │
│ updatedAt    │      │ createdAt        │      │ updatedAt    │
└──────────────┘      │ updatedAt        │      └──────────────┘
                      └──────────────────┘
```

### Seed Data Included
- **5 Vendors** (including 1 inactive for testing)
- **15 Purchase Orders** (various statuses)
- **10 Payments** (demonstrating partial payments)

## Implemented Features

### ✅ MUST-HAVE Features (All Completed)

#### 1. Vendor Management API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /vendors | Create a new vendor |
| GET | /vendors | List all vendors |
| GET | /vendors/:id | Get vendor details with payment summary |
| PUT | /vendors/:id | Update vendor information |

#### 2. Purchase Order API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /purchase-orders | Create a new purchase order |
| GET | /purchase-orders | List all POs (filter by vendor, status) |
| GET | /purchase-orders/:id | Get PO details with payment history |
| PATCH | /purchase-orders/:id/status | Update PO status |

#### 3. Payment Recording API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /payments | Record a payment against a PO |
| GET | /payments | List all payments |
| GET | /payments/:id | Get payment details |

#### 4. Analytics API (Both Implemented!)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/vendor-outstanding | Outstanding balance by vendor |
| GET | /analytics/payment-aging | Aging report (0-30, 31-60, 61-90, 90+ days) |

### ✅ NICE-TO-HAVE Features Implemented

- ✅ **JWT Authentication** - All endpoints protected with Bearer token
- ✅ **Swagger/OpenAPI Documentation** - Auto-generated at `/api`
- ✅ **Database Transactions** - For payment operations (atomic updates)
- ✅ **Docker Support** - Dockerfile and docker-compose.yml included
- ✅ **Both Analytics Endpoints** - vendor-outstanding AND payment-aging

### Business Logic Implemented

| Rule | Status |
|------|--------|
| Vendor name must be unique | ✅ |
| Vendor email must be unique and validated | ✅ |
| Cannot create PO for inactive vendors | ✅ |
| Auto-generate PO numbers (PO-YYYYMMDD-XXX) | ✅ |
| Auto-calculate due date from vendor payment terms | ✅ |
| Auto-calculate total amount from line items | ✅ |
| Cannot pay more than outstanding amount | ✅ |
| Payment amount must be positive | ✅ |
| Auto-update PO status on payment | ✅ |
| Database transactions for payment operations | ✅ |

## Key Design Decisions

1. **Prisma ORM**: Chosen for type safety, auto-generated migrations, and excellent TypeScript integration
2. **Transaction for Payments**: Uses `prisma.$transaction()` to ensure atomicity when creating payment and updating PO status
3. **Auto-generated Reference Numbers**: Format `PO-YYYYMMDD-XXX` and `PAY-YYYYMMDD-XXX` includes date for easy sorting/filtering
4. **Payment Terms as Integer**: Stored as days (7, 15, 30, etc.) for easy due date calculation
5. **JWT Global Guard**: Applied at app level with `@Public()` decorator for login endpoint
6. **Line Items as JSON**: Flexible storage for PO items without additional table complexity

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/login | ❌ | Get JWT token |
| POST | /vendors | ✅ | Create vendor |
| GET | /vendors | ✅ | List vendors |
| GET | /vendors/:id | ✅ | Get vendor with payment summary |
| PUT | /vendors/:id | ✅ | Update vendor |
| POST | /purchase-orders | ✅ | Create PO |
| GET | /purchase-orders | ✅ | List POs (filter: vendorId, status) |
| GET | /purchase-orders/:id | ✅ | Get PO with payments |
| PATCH | /purchase-orders/:id/status | ✅ | Update PO status |
| POST | /payments | ✅ | Record payment |
| GET | /payments | ✅ | List payments |
| GET | /payments/:id | ✅ | Get payment details |
| GET | /analytics/vendor-outstanding | ✅ | Outstanding by vendor |
| GET | /analytics/payment-aging | ✅ | Aging report |

## Testing the API

### Quick Start with cURL

#### 1. Login to get JWT Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
Response: `{"access_token": "eyJhbGc..."}`

#### 2. Use Token for Protected Endpoints
```bash
# Set token variable
TOKEN="your_token_here"

# List all vendors
curl http://localhost:3000/vendors \
  -H "Authorization: Bearer $TOKEN"
```

### Testing Core Business Flows

#### Flow 1: Create Vendor → Create PO → Make Partial Payment
```bash
# 1. Create vendor
curl -X POST http://localhost:3000/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Vendor","email":"test@vendor.com","paymentTerms":30}'

# 2. Create PO (use vendorId from response)
curl -X POST http://localhost:3000/purchase-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorId":"<vendor-id>","date":"2026-01-14","items":[{"description":"Item A","quantity":2,"unitPrice":500}]}'

# 3. Make partial payment (use PO id from response)
curl -X POST http://localhost:3000/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"poId":"<po-id>","amount":500,"paymentMethod":"NEFT"}'

# 4. Verify PO status changed to PARTIALLY_PAID
curl http://localhost:3000/purchase-orders/<po-id> \
  -H "Authorization: Bearer $TOKEN"
```

#### Flow 2: Test Overpayment Prevention
```bash
# Try to pay more than outstanding - should fail with 400
curl -X POST http://localhost:3000/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"poId":"<po-id>","amount":999999,"paymentMethod":"NEFT"}'
```
Expected: `400 Bad Request - Payment amount exceeds outstanding balance`

#### Flow 3: Test Inactive Vendor Prevention
```bash
# Try to create PO for inactive vendor - should fail
curl -X POST http://localhost:3000/purchase-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorId":"<inactive-vendor-id>","date":"2026-01-14","items":[{"description":"Test","quantity":1,"unitPrice":100}]}'
```
Expected: `400 Bad Request - Cannot create PO for inactive vendor`

#### Flow 4: Check Analytics
```bash
# Outstanding by vendor
curl http://localhost:3000/analytics/vendor-outstanding \
  -H "Authorization: Bearer $TOKEN"

# Aging report
curl http://localhost:3000/analytics/payment-aging \
  -H "Authorization: Bearer $TOKEN"
```

### Using Swagger UI

1. Open http://localhost:3000/api
2. Click **Authorize** button (top right)
3. Enter: `Bearer <your_token>`
4. All endpoints are now accessible

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / Business rule violation |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 409 | Conflict (duplicate vendor name/email) |
| 500 | Server error |

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed script
│   └── migrations/        # Database migrations
├── src/
│   ├── main.ts            # Application entry point
│   ├── app.module.ts      # Root module
│   ├── auth/              # JWT authentication
│   ├── vendor/            # Vendor CRUD
│   ├── purchase-order/    # PO management
│   ├── payment/           # Payment recording
│   ├── analytics/         # Analytics endpoints
│   └── prisma/            # Prisma service
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Time Breakdown

| Task | Time |
|------|------|
| Database design & schema | 1 hour |
| API development | 3 hours |
| Authentication setup | 0.5 hours |
| Testing & debugging | 1 hour |
| Docker setup | 0.5 hours |
| Documentation | 0.5 hours |
| **Total** | **~6.5 hours** |

## What's Completed

✅ All MUST-HAVE features implemented and tested  
✅ JWT authentication with hardcoded user  
✅ Both analytics endpoints (vendor-outstanding + payment-aging)  
✅ Swagger documentation with JWT support  
✅ Database transactions for payments  
✅ Docker support for deployment  
✅ Seed script with 5 vendors, 15 POs, 10 payments  
✅ Proper validation and error handling
