# Next.js Analytics Dashboard - Project Structure & Standards

## 📁 Project Structure

```
ma-dashboard/
├── src/
│   ├── app/                         # Next.js App Router entry
│   │   ├── layout.tsx               # Root layout (providers, shells)
│   │   ├── page.tsx                 # Landing page (if any)
│   │   ├── (dashboard)/             # Dashboard route group
│   │   │   ├── dashboard/page.tsx   # Main dashboard
│   │   │   ├── sales/page.tsx       # Sales analytics
│   │   │   ├── customers/page.tsx   # Customers analytics
│   │   │   ├── employees/page.tsx   # Employees analytics
│   │   │   ├── branches/page.tsx    # Branches analytics
│   │   │   ├── operations/page.tsx  # Operations analytics
│   │   │   ├── discounts/page.tsx   # Discounts analytics
│   │   │   ├── agreements/page.tsx  # Agreements analytics
│   │   │   ├── transactions/page.tsx
│   │   │   ├── sales-method/page.tsx
│   │   │   ├── ai-forecast/page.tsx
│   │   │   ├── ai-basket/page.tsx
│   │   │   ├── time-compare/page.tsx
│   │   │   └── reports/page.tsx
│   │   └── login/page.tsx           # Login route
│   │
│   ├── api/                         # API configuration and HTTP methods
│   │   ├── config.ts                # Axios instance with interceptors
│   │   └── index.ts                 # HTTP methods (get, post, edit, patch, remove)
│   │
│   ├── components/                  # Feature-based component organization
│   │   ├── layout/                  # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── Shell.tsx
│   │   ├── ui/                      # shadcn/ui + custom UI
│   │   │   ├── ChartCard.tsx
│   │   │   ├── DrillDownTable.tsx
│   │   │   ├── TreeDrillDown.tsx
│   │   │   ├── GlobalFilterBar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ... (other ui components)
│   │   └── Shared/                  # Reusable shared components
│   │       └── ImageWithFallback.tsx
│   │
│   ├── core/                        # Core reusable components
│   │   ├── ExportButton.tsx         # Excel export functionality
│   │   ├── Pagination.tsx           # Pagination component
│   │   └── Spinner.tsx              # Loading spinner
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useMutation.ts           # Mutation hooks (POST, PUT, PATCH, DELETE)
│   │   ├── useQuery.ts              # Query hook (GET requests)
│   │   └── ...                      # Validation / domain hooks
│   │
│   ├── lib/                         # Library helpers & config
│   │   ├── colors.ts                # Centralized color palette
│   │   └── mockData.ts              # Local mock data generators
│   │
│   ├── services/                    # Service layer
│   │   └── auth.ts                  # Authentication helpers
│   │
│   ├── store/                       # Global state (e.g. theme, layout)
│   │   └── themeStore.ts
│   │
│   ├── styles/                      # Global styles
│   │   ├── globals.css              # Imported in app/layout.tsx
│   │   └── theme.css
│   │
│   └── utils/                       # Utility functions
│       ├── formatDate.ts
│       ├── formatDateTime.ts
│       ├── showErrorMessages.ts
│       └── toLocalISOString.ts
│
├── public/                          # Public static files
├── .env.local                       # Environment variables (NEXT_PUBLIC_API_BASE_URL)
├── next.config.mjs                  # Next.js configuration
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔄 Data Fetching Architecture

### 1. API Layer (`src/api/`)

#### **config.ts** - Axios Configuration
- Creates axios instance with interceptors
- **Base URL**: Uses `NEXT_PUBLIC_API_BASE_URL` from environment variables
- **Request Interceptor**: Adds authentication token from localStorage
- **Response Interceptor**: Handles token refresh on 401 errors
- Automatic token refresh with request retry
- FormData support (removes Content-Type header for FormData)

#### **index.ts** - HTTP Methods
```typescript
// Available methods:
- get(endpoint, config?)      // GET request
- post(endpoint, body)        // POST request
- edit(endpoint, body)        // PUT request
- patch(endpoint, body)       // PATCH request
- remove(endpoint, body?)     // DELETE request
```

### 2. Custom Hooks (`src/hooks/`)

#### **useQuery.ts** - Data Fetching Hook
```typescript
useCustomQuery<TData>(
  endpoint: string,
  queryKey: QueryKey,
  config?: AxiosRequestConfig,
  enabled?: boolean,
  options?: UseQueryOptions
)
```

**Usage Example:**
```typescript
const { data, isLoading, error } = useCustomQuery(
  `dashboard-v2/stats/`,
  ["dashboard-stats"]
);
```

**Key Features:**
- Built on TanStack Query (React Query)
- Automatic caching and refetching
- Loading and error states
- Query key-based cache invalidation
- TypeScript generics for type safety

#### **useMutation.ts** - Data Mutation Hooks
```typescript
// POST - Create new resource
useCustomPost(endpoint: string, queryKey?: string[])

// PUT - Full update
useCustomUpdate(endpoint: string, queryKey?: string[])

// PATCH - Partial update
useCustomPatch(endpoint: string, queryKey: string[])

// DELETE - Remove resource
useCustomRemove(endpoint: string, queryKey: string[])
```

**Usage Example:**
```typescript
const { mutateAsync: createProduct, isPending } = useCustomPost(
  "products/",
  ["products"]
);

await createProduct(productData);
// Automatically invalidates "products" query cache
```

**Key Features:**
- Automatic cache invalidation on success
- Loading states via `isPending`
- Error handling support
- TypeScript support

### 3. Data Fetching Patterns

#### **Pattern 1: List/Table Data with Pagination**
```typescript
// 1. State management
const [page, setPage] = useState(1);
const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

// 2. Debounce search (500ms delay)
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 700);
  return () => clearTimeout(timer);
}, [searchQuery]);

// 3. Build query params
const queryParams = new URLSearchParams();
if (debouncedSearchQuery) queryParams.append("search", debouncedSearchQuery);
queryParams.append("page", page.toString());
const query = queryParams.toString();

// 4. Fetch data
const { data, isLoading } = useCustomQuery(
  `orders/?${query}`,
  ["orders", debouncedSearchQuery, page]
);

// 5. Extract data
const ordersData = data?.data || [];
const count = data?.count || 0;
```

#### **Pattern 2: Create/Update Operations**
```typescript
// 1. Setup mutation
const { mutateAsync: createItem, isPending } = useCustomPost(
  "products/",
  ["products"]
);

// 2. Handle submit
const handleSubmit = async (formData) => {
  try {
    await createItem(formData);
    toast.success("تم الإنشاء بنجاح");
    navigate("/products");
  } catch (error) {
    handleErrorAlerts(error.response?.data);
  }
};
```

#### **Pattern 3: Delete Operations**
```typescript
const { mutateAsync: deleteItem } = useCustomRemove(
  `products/${id}/`,
  ["products"]
);

await deleteItem();
```

### 4. Query Key Strategy

**Format:** `["resource-name", ...dependencies]`

**Best Practices:**
- Include all filter/search parameters in query key
- Include pagination state
- Use consistent naming across the app

**Examples:**
```typescript
// Simple list
["products"]

// With search and pagination
["products", debouncedSearchQuery, page]

// With filters
["orders", statusFilter, startDate, endDate, page]

// Detail view
["order", orderId]

// Dashboard stats
["dashboard-stats"]
["dashboard-revenue-trend"]
["dashboard-active-users-trend"]
```

---

## 📂 Folder Organization Principles

### 1. **Feature-Based Component Organization**
Components are organized by feature/domain, not by type:
```
components/
├── Dashboard/          # All dashboard-related components
│   ├── StatsGrid.tsx
│   ├── RevenueChart.tsx
│   ├── SalesChart.tsx
│   └── RecentActivity.tsx
├── Orders/             # All order-related components
│   ├── OrdersTable.tsx
│   └── OrdersFilters.tsx
├── Products/           # All product-related components
│   ├── ProductsTable.tsx
│   └── ProductsFilters.tsx
└── Shared/             # Truly shared components
```

### 2. **Separation of Concerns**

- **`app/`**: Route-level components and layouts (file‑system routing)
- **`components/`**: Reusable, feature-specific components
- **`core/`**: Highly reusable core components (Pagination, Spinner, ExportButton)
- **`hooks/`**: Custom React hooks
- **`utils/`**: Pure utility functions
- **`services/`**: Service layer (API calls, auth logic)
- **`api/`**: HTTP client configuration
- **`ui/`**: shadcn/ui component library

### 3. **Component Naming Conventions**

- **Pages**: PascalCase (e.g., `Dashboard.tsx`, `Orders.tsx`)
- **Components**: PascalCase (e.g., `OrdersTable.tsx`, `ProductsFilters.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCustomQuery.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase interfaces/types (e.g., `Order`, `Product`)

### 4. **File Organization Within Features**

For complex features, organize by concern:
```
OrderDetails/
├── OrderDetailsHeader.tsx    # Header component
├── OrderItemsTable.tsx        # Items table
├── OrderSummary.tsx           # Summary card
├── CustomerInfoCard.tsx       # Customer info
├── ShippingAddressCard.tsx    # Shipping address
├── PaymentInfoCard.tsx        # Payment info
├── OrderTimelineCard.tsx      # Timeline
├── AddProductDialog.tsx       # Add product dialog
├── types.ts                   # TypeScript types
└── constants.ts               # Constants
```

---

## 🧩 Main Components

### Core Components (`src/core/`)

#### **Pagination.tsx**
- Reusable pagination component
- RTL support
- Responsive design
- Props: `currentPage`, `count`, `onPageChange`, `pageSize?` (default: 15)

#### **Spinner.tsx**
- Loading spinner component
- Used in global loader and local loading states

#### **ScrollToTop.tsx**
- Scrolls to top on route change

#### **ExportButton.tsx**
- Excel export functionality
- Handles API calls and file downloads
- Loading states

### UI Components (`src/components/ui/`)

The project uses **shadcn/ui** components built on Radix UI primitives:
- `Button``, `Input`, `Card`, `Dialog`, `Select`, `Table`, `Badge`, `Avatar`, etc.
- All components are styled with Tailwind CSS
- Fully accessible and customizable

### Shared Components (`src/components/Shared/`)

#### **ImageWithFallback.tsx**
- Image component with fallback handling
- Handles broken image URLs gracefully

### Feature Components Pattern

Each feature typically includes:
1. **Table Component**: Desktop table view with native HTML tables
2. **Filters Component**: Search and filter controls
3. **Stats Component** (optional): Summary statistics
4. **Dialog Components** (optional): Add/Edit modals

**Example Structure:**
```
Products/
├── ProductsTable.tsx          # Desktop table
├── ProductsFilters.tsx       # Filters
└── (Add/Edit dialogs in parent page)
```

---

## 🗄️ State Management

### Current Approach
- **React Query (TanStack Query)**: Server state management (remote data, caching, mutations)
- **React useState**: Local component/UI state
- **Zustand (`src/store/`)**: Lightweight global state for UI/session concerns (e.g. remembering the current page of a list across routes or tabs)
- **localStorage / sessionStorage**: Persistence for auth and simple session data

### Authentication State
Stored in `localStorage`:
- `tokens`: Access and refresh tokens
- `user`: User information
- `is_there_brand`: Brand configuration flag

---

## 🛠️ Utilities (`src/utils/`)

### Date Utilities

#### **toLocalISOString.ts**
Converts Date object to local ISO string format
```typescript
toLocalISOString(date?: Date | null): string | undefined
// Returns: "2024-01-15T14:30:00"
```

#### **formatDate.ts**
Formats date string to YYYY-MM-DD
```typescript
formatDate(dateString: string | null | Date): string
// Returns: "2024-01-15" or "-"
```

#### **formatDateTime.ts**
Formats datetime with AM/PM
```typescript
formatDateTimeSimple(isoString: string): string
// Returns: "15-01-2024 2:30 PM"
```

### Error Handling

#### **showErrorMessages.ts**
Displays error messages using sonner toast
```typescript
handleErrorAlerts(errorObj: { [key: string]: string[] | string } | string)
```
- Handles both string and object error formats
- Formats field names (snake_case to Title Case)
- Shows multiple error messages

---

## 🔐 Authentication & Authorization

### Authentication Service (`src/services/auth.ts`)

**Interfaces:**
```typescript
interface Tokens {
  access: string;
  refresh: string;
}

interface User {
  id: string;
  mobile_number: string;
  // ... other user fields
}

interface LoginResponse {
  token: Tokens;
  user: User;
  is_there_brand: boolean;
}
```

**Functions:**
- `getStoredTokens()`: Retrieves tokens from localStorage
- `getStoredUser()`: Retrieves user from localStorage
- `storeTokens(tokens, user, is_there_brand, navigate?, setIsAuthenticated?)`: Stores tokens and user
- `removeTokens(navigate?, setIsAuthenticated?)`: Clears tokens and user
- `isAuthenticated()`: Checks if user is authenticated
- `login(mobile_number, password)`: Login API call

### Route Protection (Layouts / Middleware)
- Wrap dashboard routes in a protected layout under `app/(dashboard)/layout.tsx`.
- In that layout, check `isAuthenticated()` and call `redirect('/login')` from `next/navigation` when unauthenticated.
- For API‑level protection, you can also use `middleware.ts` to guard entire route groups.

### Routing (App Router)
- Routes are defined by the folder structure under `app/` (e.g. `app/(dashboard)/sales/page.tsx`).
- Shared shells live in `layout.tsx` files; there is no React Router config file.

---

## 🎨 Styling Approach

### Tailwind CSS 4
- Utility-first CSS framework
- RTL support with `dir="rtl"`
- Responsive design with breakpoints
- Consistent design system

### Table Overflow Pattern
Tables use **native HTML tables** with controlled overflow:
```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50">
        {/* Headers */}
      </tr>
    </thead>
    <tbody>
      {/* Rows */}
    </tbody>
  </table>
</div>
```

**Key Points:**
- Wrapper `div` has `overflow-x-auto` so only the **table** scrolls horizontally
- Table usually has `w-full` and, for wide datasets, an explicit `min-w-[XXXpx]` to force internal scrolling instead of page overflow
- Page layout (`main`) uses `overflow-x-hidden` so the overall page never scrolls horizontally

### Common Patterns
- Cards: `bg-white rounded-lg shadow-sm border border-gray-200`
- Buttons: `px-4 py-2 rounded-md hover:bg-{color}-600 transition-colors`
- Inputs: `w-full px-4 py-2 border border-gray-300 rounded-md`

---

## 📋 Best Practices & Standards

### 1. **Data Fetching**
- ✅ Always use `useCustomQuery` for GET requests
- ✅ Always use custom mutation hooks for POST/PUT/PATCH/DELETE
- ✅ Debounce search inputs (700ms)
- ✅ Reset pagination when filters change
- ✅ Use query keys consistently

### 2. **Component Structure**
- ✅ Keep components focused and single-purpose
- ✅ Extract complex logic into custom hooks
- ✅ Separate filter components into their own files
- ✅ Use TypeScript interfaces for props
- ✅ Keep components under 150 lines when possible

### 3. **State Management**
- ✅ Use `useState` for local component state
- ✅ Use React Query for server state
- ✅ Use localStorage for authentication
- ✅ Avoid prop drilling

### 4. **Error Handling**
- ✅ Use `handleErrorAlerts` for error messages
- ✅ Wrap API calls in try-catch
- ✅ Show user-friendly error messages

### 5. **Loading States**
- ✅ Show loading indicators during queries
- ✅ Show loading indicators during mutations
- ✅ Use `isLoading` and `isPending` appropriately

### 6. **Code Organization**
- ✅ Feature-based folder structure
- ✅ Consistent naming conventions
- ✅ Separate concerns (pages, components, hooks, utils)
- ✅ Reusable components in `Shared/` or `core/`

### 7. **Tables**
- ✅ Use native HTML tables with `overflow-x-auto` wrapper
- ✅ Ensure page layout prevents horizontal overflow
- ✅ Use consistent styling (border-gray-200, bg-gray-50 for headers)

---

## 🚀 Getting Started Template

### Creating a New Feature Route (Next.js App Router)

1. **Create Page Component** (`src/app/feature/page.tsx`)
```typescript
'use client';

import { useState, useEffect } from "react";
import { useCustomQuery } from "@/hooks/useQuery";
import FeatureTable from "@/components/FeatureName/FeatureTable";
import FeatureFilters from "@/components/FeatureName/FeatureFilters";
import Pagination from "@/core/Pagination";

export default function FeatureNamePage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 700);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = new URLSearchParams();
  if (debouncedSearchQuery) queryParams.append("search", debouncedSearchQuery);
  queryParams.append("page", page.toString());
  const query = queryParams.toString();

  const { data, isLoading } = useCustomQuery(
    `feature/?${query}`,
    ["feature", debouncedSearchQuery, page]
  );

  const items = data?.data || [];
  const count = data?.count || 0;

  return (
    <div className="p-4 sm:p-6" dir="rtl">
      <FeatureFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <FeatureTable items={items} />
          <Pagination
            currentPage={page}
            count={count}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
```

2. **Create Feature Components** (`src/components/FeatureName/`)
   - `FeatureTable.tsx` (native HTML table)
   - `FeatureFilters.tsx`

3. **Route is auto‑wired** because of the file path `app/feature/page.tsx` (no manual router config needed).

---

## 📝 Summary

This project follows a **modern, scalable Next.js architecture** with:

- ✅ **Feature-based organization** for maintainability
- ✅ **TanStack Query** (or similar) for server state management
- ✅ **TypeScript** for type safety
- ✅ **Consistent patterns** across all features
- ✅ **Reusable components** and utilities
- ✅ **Authentication-based routing** using layouts / middleware
- ✅ **RTL support** for Arabic
- ✅ **Responsive design** with Tailwind CSS 4
- ✅ **shadcn/ui** component library
- ✅ **ECharts** for data visualization
- ✅ **Next.js App Router** for routing

Use this structure and patterns as a template for future features to ensure consistency and maintainability.

---

## 🔗 Path Alias Configuration (@ Alias)

The project uses the `@` alias to simplify imports and improve code readability. The `@` symbol maps to the `src/` directory.

### Configuration (Next.js + TypeScript)

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Usage Examples

Instead of relative imports:
```typescript
// ❌ Relative imports (hard to maintain)
import { Card } from "../../components/ui/card";
import { Dashboard } from "../pages/Dashboard";
import { get } from "../../api";
```

Use the `@` alias:
```typescript
// ✅ Alias imports (clean and maintainable)
import { Card } from "@/components/ui/card";
import { Dashboard } from "@/pages/Dashboard";
import { get } from "@/api";
```

### Common Import Patterns

```typescript
// Components
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout/Layout";

// Pages
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";

// API & Services
import { get, post } from "@/api";
import { storeTokens } from "@/services/auth";

// Hooks
import { useCustomQuery } from "@/hooks/useQuery";
import { useCustomPost } from "@/hooks/useMutation";

// Utils
import formatDate from "@/utils/formatDate";
import handleErrorAlerts from "@/utils/showErrorMessages";

// Core Components
import Pagination from "@/core/Pagination";
import Spinner from "@/core/Spinner";

// Styles
import "@/index.css";
```

### Benefits

- **Cleaner imports**: No more `../../../` chains
- **Easier refactoring**: Moving files doesn't break imports
- **Better readability**: Clear indication of project structure
- **IDE support**: Better autocomplete and navigation
- **Consistency**: Uniform import style across the project

---

## 🌍 Environment Variables

The project uses **Next.js environment variables**:

### Configuration

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=https://e-commerce-v2-7n8e6.ondigitalocean.app/api
```

### Usage

Access environment variables in client components:
```typescript
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

---

## 📊 Charting

The project uses **Apache ECharts** (via `echarts-for-react`) wrapped in a reusable `ChartCard` component.

### Basic Setup in a Client Component

```typescript
'use client';

import ReactECharts from 'echarts-for-react';

const option = {
  xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar'] },
  yAxis: { type: 'value' },
  series: [
    { type: 'bar', data: [100, 200, 150] },
  ],
};

export default function ExampleChart() {
  return <ReactECharts option={option} style={{ height: 320 }} />;
}
```

---

## 📅 Date Pickers

The project uses **react-date-picker** for date selection.

### Usage Example

```typescript
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

const [date, setDate] = useState<Date | null>(null);

<DatePicker
  onChange={setDate}
  value={date}
  clearIcon={undefined}
  calendarIcon={undefined}
  className="w-full"
/>
```

---

## 🔔 Notifications

The project uses **sonner** for toast notifications.

### Setup

```typescript
import { Toaster } from "sonner";

<Toaster position="top-center" richColors />
```

### Usage

```typescript
import { toast } from "sonner";

toast.success("تم الحفظ بنجاح");
toast.error("حدث خطأ");
toast.info("معلومة");
```
