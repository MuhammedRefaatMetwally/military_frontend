# Quick Reference Guide - Next.js Analytics Dashboard

## 🚀 Common Code Patterns

### 1. Fetching Data with Search & Pagination

```typescript
// State
const [page, setPage] = useState(1);
const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

// Debounce (500ms)
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 700);
  return () => clearTimeout(timer);
}, [searchQuery]);

// Build query
const queryParams = new URLSearchParams();
if (debouncedSearchQuery) queryParams.append("search", debouncedSearchQuery);
queryParams.append("page", page.toString());
const query = queryParams.toString();

// Fetch
const { data, isLoading } = useCustomQuery(
  `products/?${query}`,
  ["products", debouncedSearchQuery, page]
);

// Extract
const items = data?.data || [];
const count = data?.count || 0;
```

### 2. Create Operation

```typescript
import { toast } from "sonner";
import { useCustomPost } from "@/hooks/useMutation";
import handleErrorAlerts from "@/utils/showErrorMessages";

const { mutateAsync: createItem, isPending } = useCustomPost(
  "products/",
  ["products"]
);

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

### 3. Update Operation

```typescript
import { toast } from "sonner";
import { useCustomPatch } from "@/hooks/useMutation";
import handleErrorAlerts from "@/utils/showErrorMessages";

const { mutateAsync: updateItem, isPending } = useCustomPatch(
  `products/${id}/`,
  ["products"]
);

const handleUpdate = async (formData) => {
  try {
    await updateItem(formData);
    toast.success("تم التحديث بنجاح");
    navigate("/products");
  } catch (error) {
    handleErrorAlerts(error.response?.data);
  }
};
```

### 4. Delete Operation

```typescript
import { toast } from "sonner";
import { useCustomRemove } from "@/hooks/useMutation";
import handleErrorAlerts from "@/utils/showErrorMessages";

const { mutateAsync: deleteItem } = useCustomRemove(
  `products/${id}/`,
  ["products"]
);

const handleDelete = async () => {
  try {
    await deleteItem();
    toast.success("تم الحذف بنجاح");
  } catch (error) {
    handleErrorAlerts(error.response?.data);
  }
};
```

### 5. Date Picker with React Hook Form

```typescript
import { Controller } from "react-hook-form";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { toLocalISOString } from "@/utils/toLocalISOString";

type DatePickerValue = Date | null;

<Controller
  name="date"
  control={control}
  rules={{ required: "التاريخ مطلوب" }}
  render={({ field }) => (
    <DatePicker
      selected={field.value ? new Date(field.value) : null}
      onChange={(date) => field.onChange(toLocalISOString(date))}
      showTimeSelect
      timeIntervals={60}
      timeFormat="HH:mm"
      dateFormat="yyyy-MM-dd HH:mm"
      locale={ar}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
      placeholderText="اختر التاريخ والوقت"
    />
  )}
/>
```

### 6. Form with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import handleErrorAlerts from "@/utils/showErrorMessages";

const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    name: "",
    email: "",
  }
});

const onSubmit = async (data) => {
  try {
    await createItem(data);
    toast.success("تم الحفظ بنجاح");
  } catch (error) {
    handleErrorAlerts(error.response?.data);
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input
    {...register("name", { required: "الاسم مطلوب" })}
    className="w-full px-4 py-2 border rounded-md"
  />
  {errors.name && <span className="text-red-500">{errors.name.message}</span>}
</form>
```

### 7. Loading States

```typescript
// Query loading
const { data, isLoading } = useCustomQuery(...);

// Mutation loading
const { mutateAsync, isPending } = useCustomPost(...);

// Conditional rendering
{isLoading ? (
  <Spinner />
) : (
  <Table data={data} />
)}

// Button with loading state
<Button disabled={isPending}>
  {isPending ? "جاري الحفظ..." : "حفظ"}
</Button>
```

### 8. Pagination Component

```typescript
import Pagination from "@/core/Pagination";

<Pagination
  currentPage={page}
  count={count}
  onPageChange={setPage}
  pageSize={15} // optional, defaults to 15
/>
```

### 9. Toast Notifications (Sonner)

```typescript
import { toast } from "sonner";

// Success
toast.success("تم الحفظ بنجاح");

// Error
toast.error("حدث خطأ");

// Info
toast.info("معلومة");

// Warning
toast.warning("تحذير");
```

### 10. Error Handling

```typescript
import handleErrorAlerts from "@/utils/showErrorMessages";

try {
  await apiCall();
} catch (error) {
  handleErrorAlerts(error.response?.data);
  // or
  handleErrorAlerts("Error message");
}
```

### 11. Date Formatting

```typescript
import formatDate from "@/utils/formatDate";
import { formatDateTimeSimple } from "@/utils/formatDateTime";
import { toLocalISOString } from "@/utils/toLocalISOString";

// Display date
formatDate(dateString); // "2024-01-15"

// Display datetime
formatDateTimeSimple(isoString); // "15-01-2024 2:30 PM"

// Send to API
toLocalISOString(date); // "2024-01-15T14:30:00"
```

### 12. Query Key Patterns

```typescript
// Simple list
["products"]

// With search
["products", searchQuery]

// With pagination
["products", page]

// With filters
["orders", statusFilter, startDate, endDate, page]

// Detail view
["order", orderId]

// Dashboard
["dashboard-stats"]
["dashboard-revenue-trend"]
["dashboard-active-users-trend"]
```

### 13. Modal/Dialog Pattern

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>عنوان الحوار</DialogTitle>
      <DialogDescription>وصف الحوار</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### 14. Table with Overflow

```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50">
        <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">
          العمود
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td className="py-4 px-6">{item.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### 15. Authentication Check

```typescript
import { isAuthenticated, getStoredUser } from "@/services/auth";

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = getStoredUser();
```

### 16. Navigation (Next.js App Router)

```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// Navigate to route
router.push("/products");

// Navigate with search params
router.push("/products?tab=active");
```

### 17. ECharts Line/Bar Chart (Next.js client component)

```typescript
'use client';

import ReactECharts from 'echarts-for-react';

const option = {
  xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar'] },
  yAxis: { type: 'value' },
  series: [
    { name: 'Revenue', type: 'line', data: [100, 200, 150] },
  ],
};

export default function ExampleChart() {
  return <ReactECharts option={option} style={{ height: 320 }} />;
}
```

### 18. Remembering List Page with Zustand

Use a small store to keep the current page when navigating to detail/edit screens or opening them in a new tab.

```typescript
// src/store/productsListStore.ts
import { create } from "zustand";

interface ProductsListStore {
  page: number;
  setPage: (page: number) => void;
}

export const useProductsListStore = create<ProductsListStore>((set) => ({
  page: 1,
  setPage: (page) => set({ page }),
}));

// In list page
const page = useProductsListStore((s) => s.page);
const setPage = useProductsListStore((s) => s.setPage);
```

---

## 📁 File Structure Template (Next.js)

### New Feature Structure

```
src/
├── app/
│   └── feature/
│       └── page.tsx
└── components/
    └── FeatureName/
        ├── FeatureTable.tsx
        ├── FeatureFilters.tsx
        └── (optional: FeatureStats.tsx)
```

---

## 🔑 Key Imports

```typescript
// Data Fetching
import { useCustomQuery } from "@/hooks/useQuery";
import { useCustomPost, useCustomPatch, useCustomRemove } from "@/hooks/useMutation";

// Forms
import { useForm, Controller } from "react-hook-form";

// Notifications
import { toast } from "sonner";
import handleErrorAlerts from "@/utils/showErrorMessages";

// Routing (Next.js)
import { useRouter } from "next/navigation";
import Link from "next/link";

// State
import { useQueryClient } from "@tanstack/react-query";

// Components
import Pagination from "@/core/Pagination";
import Spinner from "@/core/Spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";

// Utils
import formatDate from "@/utils/formatDate";
import { formatDateTimeSimple } from "@/utils/formatDateTime";
import { toLocalISOString } from "@/utils/toLocalISOString";

// Services
import { storeTokens, removeTokens, isAuthenticated } from "@/services/auth";
```

---

## ✅ Checklist for New Features

- [ ] Create page component in `src/pages/`
- [ ] Create feature folder in `src/components/`
- [ ] Add table component (native HTML table with overflow-x-auto)
- [ ] Add filters component
- [ ] Implement search with debouncing (700ms)
- [ ] Add pagination
- [ ] Add error handling with `handleErrorAlerts`
- [ ] Add loading states
- [ ] Add route in `appRoutes.tsx`
- [ ] Test RTL layout
- [ ] Test responsive design
- [ ] Ensure table overflow works correctly

---

## 🎯 Common Query Key Names

- `products` - Product list
- `product` - Single product
- `orders` - Order list
- `order` - Single order
- `users` - User list
- `categories` - Category list
- `units` - Unit list
- `discount-codes` - Discount code list
- `dashboard-stats` - Dashboard statistics
- `dashboard-revenue-trend` - Revenue trend chart
- `dashboard-active-users-trend` - Active users trend chart

---

## 🔄 Cache Invalidation Strategy

```typescript
// After mutation, queries are automatically invalidated
const { mutateAsync } = useCustomPost("products/", ["products"]);

// Manual invalidation if needed
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ["products"] });
```

---

## 📱 Responsive Patterns

```typescript
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  <Table />
</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">
  <Card />
</div>

// Responsive padding
<div className="p-4 sm:p-6">
  {/* Content */}
</div>
```

---

## 🌐 RTL Support

```typescript
// Always add dir="rtl" to main container
<div className="p-4" dir="rtl">
  {/* Content */}
</div>

// Use RTL-aware classes
className="pr-4 pl-2" // padding-right, padding-left
className="text-right" // text alignment
className="ml-auto" // margin-left auto (becomes margin-right in RTL)
```

---

## 🔗 Path Alias (@) Usage

The project uses `@` alias to reference the `src/` directory. Always use `@` instead of relative paths.

### Import Examples

```typescript
// Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/Layout/Layout";

// Pages
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";

// API
import { get, post, patch, remove } from "@/api";

// Hooks
import { useCustomQuery } from "@/hooks/useQuery";
import { useCustomPost, useCustomPatch } from "@/hooks/useMutation";

// Utils
import formatDate from "@/utils/formatDate";
import { formatDateTimeSimple } from "@/utils/formatDateTime";
import { toLocalISOString } from "@/utils/toLocalISOString";
import handleErrorAlerts from "@/utils/showErrorMessages";

// Services
import { storeTokens, removeTokens } from "@/services/auth";

// Core Components
import Pagination from "@/core/Pagination";
import Spinner from "@/core/Spinner";
import ScrollToTop from "@/core/ScrollToTop";

// Styles
import "@/index.css";
```

### Quick Migration Guide

**Before (Relative Imports):**
```typescript
import { Card } from "../components/ui/card";
import { Dashboard } from "../pages/Dashboard";
import { get } from "../api";
```

**After (Alias Imports):**
```typescript
import { Card } from "@/components/ui/card";
import { Dashboard } from "@/pages/Dashboard";
import { get } from "@/api";
```

### Benefits

- ✅ No more `../../../` chains
- ✅ Easier to refactor and move files
- ✅ Better IDE autocomplete
- ✅ Clearer project structure
- ✅ Consistent across the codebase

---

## 🌍 Environment Variables

### Setup

Create `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=https://e-commerce-v2-7n8e6.ondigitalocean.app/api
```

### Usage

```typescript
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
```

---

## 📊 Charting Setup (ECharts)

The project uses Apache ECharts via `echarts-for-react`, usually inside `ChartCard`.

### Basic Registration

```typescript
'use client';

import ReactECharts from 'echarts-for-react';

const option = {
  xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [100, 200, 150] }],
};

export default function ExampleChart() {
  return <ReactECharts option={option} style={{ height: 320 }} />;
}
```

---

## 📅 Date Picker Setup

### Required Imports

```typescript
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
```

### Basic Usage

```typescript
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

## 🔔 Toast Setup

### App Setup

```typescript
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      {/* Rest of app */}
    </>
  );
}
```

### Usage

```typescript
import { toast } from "sonner";

toast.success("تم الحفظ بنجاح");
toast.error("حدث خطأ");
```

---

This quick reference should help you quickly implement common patterns in the project!
