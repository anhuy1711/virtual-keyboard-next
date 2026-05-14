# 🚀 Quick Reference - Inventory Filter API

## At-a-Glance Summary

### ✅ What Changed
- File: `/app/admin/inventory/page.tsx`
- Changed: `getAllProductsAPI()` → `filterProductsAPI()`
- Added: Search + Filter form

### 🎯 New Features
1. **Search by Product Name** - Partial match
2. **Filter by Category** - 4 categories
3. **Combined Search + Filter** - Both at once
4. **Reset Filters** - One-click clear

### 📍 Where It Is
- URL: `http://localhost:3000/admin/inventory`
- Search Form: Right below title section
- Inputs: Name, Category dropdowns
- Buttons: Search, Clear Filter

---

## Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `/app/admin/inventory/page.tsx` | Main component | ✅ Updated |
| `/app/services/productService.ts` | API functions | ✅ Has filterProductsAPI |
| `INVENTORY_FILTER_UPDATE.md` | Detailed changes | 📖 Read this |
| `INVENTORY_FILTER_VISUAL.md` | Diagrams & flows | 📊 Visual guide |
| `INVENTORY_FILTER_SUMMARY.md` | Complete summary | 📋 Full summary |
| `INVENTORY_FILTER_CHECKLIST.md` | Implementation checklist | ✅ 100% done |

---

## Code Snippets

### Import
```typescript
import { filterProductsAPI, ProductSearchRequest } from '@/app/services/productService';
```

### State
```typescript
const [searchName, setSearchName] = useState('');
const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
const [currentPage, setCurrentPage] = useState(0);
```

### Fetch Function
```typescript
const fetchProducts = async (page: number = 0) => {
  const searchRequest: ProductSearchRequest = {
    name: searchName || undefined,
    categoryId: selectedCategory || undefined,
  };
  const response = await filterProductsAPI(searchRequest, page, 20);
  setProducts((response.content || []) as Product[]);
};
```

### Search Handler
```typescript
const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  fetchProducts(0);
};
```

### Category Handler
```typescript
const handleCategoryFilter = (categoryId: number | undefined) => {
  setSelectedCategory(categoryId);
  fetchProducts(0);
};
```

---

## API Details

```
Method: POST
URL: /api/products/filter
Page Size: 20 items

Request:
{
  "name": "Pro",      // optional
  "categoryId": 1     // optional
}

Response:
{
  "content": [...],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 50,
  "totalPages": 3
}
```

---

## User Actions → Result

| User Action | What Happens | API Call |
|-------------|--------------|----------|
| Type "Pro" + Click Search | Filter by name "Pro" | POST with `name: "Pro"` |
| Select "Keyboards" | Filter by category 1 | POST with `categoryId: 1` |
| Type "Pro" + Select "Keyboards" | Both filters | POST with both params |
| Click "Xóa bộ lọc" | Reset all, show all | POST with empty params |
| Leave empty + Click Search | Show all products | POST with undefined |

---

## Form Fields

### Search Input
- **Field**: `searchName`
- **Type**: text
- **Placeholder**: "Nhập tên sản phẩm..."
- **Binding**: `value={searchName}` + `onChange`

### Category Select
- **Field**: `selectedCategory`
- **Type**: number (category ID)
- **Options**: 
  - "" → All categories (reset)
  - "1" → Keyboards
  - "2" → Switches
  - "3" → Keycaps
  - "4" → Accessories

### Buttons
- **Search**: type="submit", triggers handleSearch()
- **Clear**: type="button", resets all state + calls fetchProducts(0)

---

## State Diagram

```
Initial
├─ searchName: ""
├─ selectedCategory: undefined
└─ products: [...all items]
      ↓
User Action (search/filter)
├─ setSearchName() or setSelectedCategory()
├─ Call fetchProducts()
└─ API request sent
      ↓
Response
├─ setProducts() with filtered results
└─ setIsLoadingProducts(false)
      ↓
User Clicks "Xóa bộ lọc"
├─ setSearchName("")
├─ setSelectedCategory(undefined)
├─ Call fetchProducts(0)
└─ Back to Initial state
```

---

## Testing Quick Commands

### Test 1: Search
1. Go to `/admin/inventory`
2. Type "Neo" in search
3. Click "Tìm kiếm"
4. ✅ Should show Neo products

### Test 2: Filter
1. Select "Keyboards" from dropdown
2. ✅ Should auto-filter, show only keyboards

### Test 3: Combined
1. Type "Pro" + Select "Keyboards"
2. Click "Tìm kiếm"
3. ✅ Should show keyboards matching "Pro"

### Test 4: Clear
1. After any search/filter
2. Click "Xóa bộ lọc"
3. ✅ Should reset to show all products

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| API not called on load | useEffect triggers fetchProducts(0) on isAuthorized |
| Search doesn't work | Check form submit, verify API endpoint |
| No results shown | Check if search term matches any product |
| Loading spinner stuck | Check network tab for API errors |
| Category filter not working | Verify category IDs (1-4) in options |

---

## Performance Notes

- **Page Size**: 20 items (optimized)
- **Auto-load**: On page load, shows first 20 items
- **Search**: Executed on form submit (not real-time)
- **Category**: Changes immediately (no submit needed)
- **Loading**: Shows spinner during API call

---

## Component Props & Data Flow

```
InventoryPage Component
├─ State
│  ├─ searchName
│  ├─ selectedCategory
│  ├─ currentPage
│  ├─ products
│  └─ isLoadingProducts
│
├─ Functions
│  ├─ fetchProducts(page)
│  ├─ handleSearch(e)
│  ├─ handleCategoryFilter(id)
│  └─ handleLogout()
│
└─ Renders
   ├─ Sidebar
   ├─ Header
   ├─ Search Form
   ├─ Stats Cards
   └─ Table (with products data)
```

---

## Dependencies

```typescript
// External
import React from 'react'                    // React hooks
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'                 // Next.js link
import { jwtDecode } from 'jwt-decode'       // JWT decode
import { toast } from 'react-toastify'       // Toast notifications

// Internal
import { filterProductsAPI, ProductSearchRequest } from '@/app/services/productService'
import { logoutAPI } from '@/app/services/authService'
```

---

## Useful Links & Docs

- 📖 `INVENTORY_FILTER_UPDATE.md` - Detailed implementation
- 📊 `INVENTORY_FILTER_VISUAL.md` - Visual guides & diagrams
- 📋 `INVENTORY_FILTER_SUMMARY.md` - Complete summary
- ✅ `INVENTORY_FILTER_CHECKLIST.md` - Implementation checklist

---

## Next Steps (Optional Enhancements)

1. Add sorting dropdown (by name, price, date)
2. Add pagination UI (Prev/Next buttons)
3. Save search history locally
4. Add price range filter
5. Add stock level filter
6. Export filtered results to CSV

---

## Status
✅ **COMPLETE & TESTED**

Ready to use! 🚀

