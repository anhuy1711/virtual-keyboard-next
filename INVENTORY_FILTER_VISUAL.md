# 📺 Visual Guide - Inventory Filter API

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                     INVENTORY PAGE                       │
└─────────────────────────────────────────────────────────┘

┌─── TITLE SECTION ──────────────────────────────────────┐
│ Product Management                                       │
│ Manage your artisan mechanical keyboard collection...   │
│ [Add Product] [Filter] [Export CSV]                    │
└────────────────────────────────────────────────────────┘

┌─── SEARCH & FILTER SECTION ────────────────────────────┐
│ ┌─ Search Input ─────────────┐  ┌─ Category Select ──┐│
│ │ 🔍 Tìm kiếm sản phẩm      │  │ Danh mục        ▼ ││
│ │ [________________]          │  │ [Tất cả danh mục] ││
│ │ "Nhập tên sản phẩm..."     │  │ [Keyboards]       ││
│ │                             │  │ [Switches]        ││
│ └─────────────────────────────┘  │ [Keycaps]         ││
│                                   │ [Accessories]     ││
│                                   └──────────────────┘│
│ [🔍 Tìm kiếm]  [✕ Xóa bộ lọc]                        │
└────────────────────────────────────────────────────────┘

┌─── STATS SECTION ──────────────────────────────────────┐
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│ │ 1,284   │  │   42    │  │    8    │  │ $182.4k │   │
│ │ Products│  │ Orders  │  │ Low Stk │  │ Value   │   │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└────────────────────────────────────────────────────────┘

┌─── TABLE SECTION ─────────────────────────────────────┐
│ Product Name    │ Category  │ SKUs  │ Status │ Actions│
├─────────────────┼───────────┼───────┼────────┼────────┤
│ [🖼️] Neo98      │ Keyboards │  3    │ Active │ ✎ ✕   │
├─────────────────┼───────────┼───────┼────────┼────────┤
│ [🖼️] Pro65      │ Keyboards │  2    │ Active │ ✎ ✕   │
├─────────────────┼───────────┼───────┼────────┼────────┤
│ [🖼️] Keycap Set │ Keycaps   │  1    │ Active │ ✎ ✕   │
└─────────────────┴───────────┴───────┴────────┴────────┘
```

---

## User Interactions

### 1️⃣ Search by Name

```
User: Enters "Pro" in search input
        ↓
onChange event → setSearchName("Pro")
        ↓
User: Clicks "Tìm kiếm" button
        ↓
handleSearch() called
        ↓
fetchProducts(0) with searchRequest:
  {
    name: "Pro",
    categoryId: undefined
  }
        ↓
filterProductsAPI(searchRequest, 0, 20)
        ↓
POST /api/products/filter?page=0&size=20
Body: { "name": "Pro", "categoryId": null }
        ↓
Backend filters products where name LIKE "%Pro%"
        ↓
Returns matching products
        ↓
setProducts([...filtered products])
        ↓
Table renders results:
  - Pro65 Keyboard Kit
  - Professional Keycap Set
  - Neo Pro Edition
```

### 2️⃣ Filter by Category

```
User: Opens dropdown and selects "Keyboards"
        ↓
onChange event → setSelectedCategory(1)
        ↓
handleCategoryFilter(1) called immediately
        ↓
fetchProducts(0) with searchRequest:
  {
    name: "",
    categoryId: 1
  }
        ↓
filterProductsAPI(searchRequest, 0, 20)
        ↓
POST /api/products/filter?page=0&size=20
Body: { "name": null, "categoryId": 1 }
        ↓
Backend filters where categoryId = 1
        ↓
Returns all keyboard products
        ↓
Table updates with keyboards only
```

### 3️⃣ Combined Search + Filter

```
User: Enters "Custom" + Selects "Keyboards"
        ↓
setSearchName("Custom") + setSelectedCategory(1)
        ↓
User: Clicks "Tìm kiếm"
        ↓
handleSearch() → fetchProducts(0)
        ↓
searchRequest = {
  name: "Custom",
  categoryId: 1
}
        ↓
filterProductsAPI(searchRequest, 0, 20)
        ↓
Backend: WHERE name LIKE "%Custom%" AND categoryId = 1
        ↓
Returns: "Custom Mechanical Keyboard", "Custom 65% Kit"
```

### 4️⃣ Clear Filters

```
User: Clicks "Xóa bộ lọc" button
        ↓
onClick handler:
  setSearchName('')
  setSelectedCategory(undefined)
  setCurrentPage(0)
        ↓
fetchProducts(0) automatically triggers
        ↓
searchRequest = {
  name: undefined,
  categoryId: undefined
}
        ↓
Backend returns ALL products (page 1)
        ↓
Table resets to full list
```

---

## Data Flow Diagram

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ├─→ Input text: "Pro" → setSearchName("Pro")
       │
       ├─→ Select category → setSelectedCategory(1)
       │
       └─→ Click search button
              ↓
        ┌──────────────────┐
        │ handleSearch()   │
        │ preventDefault() │
        │ setCurrentPage(0)│
        └────────┬─────────┘
                 ↓
        ┌──────────────────────┐
        │ fetchProducts(0)     │
        │ setIsLoading(true)   │
        └────────┬─────────────┘
                 ↓
        ┌──────────────────────────────────┐
        │ Create searchRequest:             │
        │ {                                 │
        │   name: "Pro",                    │
        │   categoryId: 1                   │
        │ }                                 │
        └────────┬─────────────────────────┘
                 ↓
        ┌──────────────────────────────────┐
        │ filterProductsAPI(               │
        │   searchRequest,                 │
        │   page,                          │
        │   pageSize: 20                   │
        │ )                                │
        └────────┬─────────────────────────┘
                 ↓
        ┌──────────────────────────────────┐
        │ POST /api/products/filter        │
        │ Body: {                          │
        │   name: "Pro",                   │
        │   categoryId: 1                  │
        │ }                                │
        └────────┬─────────────────────────┘
                 ↓
        ┌──────────────────────────────────┐
        │ Backend Processing:              │
        │ Filter WHERE                     │
        │   name LIKE "%Pro%"              │
        │   AND categoryId = 1             │
        └────────┬─────────────────────────┘
                 ↓
        ┌──────────────────────────────────┐
        │ API Response:                    │
        │ {                                │
        │   code: 200,                     │
        │   data: {                        │
        │     content: [...products],      │
        │     pageNumber: 0,               │
        │     pageSize: 20,                │
        │     totalElements: 5,            │
        │     totalPages: 1                │
        │   }                              │
        │ }                                │
        └────────┬─────────────────────────┘
                 ↓
        ┌──────────────────────────────────┐
        │ Update State:                    │
        │ setProducts(response.content)    │
        │ setCurrentPage(0)                │
        │ setIsLoading(false)              │
        └────────┬─────────────────────────┘
                 ↓
        ┌──────────────────────────────────┐
        │ Re-render Table:                 │
        │ - Pro65 Keyboard Kit             │
        │ - Professional Keycap Set        │
        │ - Neo Pro Edition                │
        └──────────────────────────────────┘
```

---

## State Changes Over Time

```
Initial State:
  searchName: ""
  selectedCategory: undefined
  products: [] (loading)
  isLoadingProducts: true
  ↓

After Page Load (isAuthorized = true):
  fetchProducts(0) called automatically
  
  Request: { name: undefined, categoryId: undefined }
  Response: All products
  ↓

State After First Load:
  searchName: ""
  selectedCategory: undefined
  products: [...all 50 products]
  isLoadingProducts: false
  ↓

User Types "Pro" + Clicks Search:
  searchName: "Pro"
  selectedCategory: undefined
  products: [...filtered 5 products]
  isLoadingProducts: false
  ↓

User Selects "Keyboards" Category:
  searchName: "Pro"
  selectedCategory: 1
  products: [...2 keyboard products matching "Pro"]
  isLoadingProducts: false
  ↓

User Clicks "Xóa bộ lọc":
  searchName: ""
  selectedCategory: undefined
  products: [...all 50 products again]
  isLoadingProducts: false
```

---

## API Calls Timeline

```
Load Page (t=0ms)
  ├─ Check Auth
  └─ useEffect triggers fetchProducts(0)
     └─ API Call 1: POST /api/products/filter (ALL)
        └─ Response: 50 products

User Types "Pro" + Clicks Search (t=5s)
  └─ handleSearch() → fetchProducts(0)
     └─ API Call 2: POST /api/products/filter (name="Pro")
        └─ Response: 5 products

User Changes Category to "Keyboards" (t=8s)
  └─ handleCategoryFilter(1) → fetchProducts(0)
     └─ API Call 3: POST /api/products/filter (name="Pro", categoryId=1)
        └─ Response: 2 products

User Clicks "Xóa bộ lọc" (t=12s)
  └─ Reset handlers → fetchProducts(0)
     └─ API Call 4: POST /api/products/filter (ALL again)
        └─ Response: 50 products
```

---

## Error Handling

```
Try Block:
  ├─ setIsLoadingProducts(true)
  ├─ Create searchRequest
  ├─ Call filterProductsAPI()
  │  └─ If API fails → catch block
  ├─ setProducts(response.content)
  └─ setCurrentPage(page)

Catch Block:
  ├─ console.error(error)
  ├─ toast.error("Lỗi khi tải...")
  └─ Display error message to user

Finally Block:
  └─ setIsLoadingProducts(false)  // Always execute
```

---

## Component Re-renders

```
Trigger: handleSearch() form submission
  ↓
State Updates:
  setCurrentPage(0)
  fetchProducts(0)
  ↓
Inside fetchProducts():
  setIsLoadingProducts(true)
  │ → Re-render: Show loading spinner
  ↓
API Response Received:
  setProducts(response.content)
  │ → Re-render: Table updates with new data
  setCurrentPage(page)
  setIsLoadingProducts(false)
  │ → Re-render: Hide loading, show results
```

---

**This diagram helps visualize how the filter API integrates with the Inventory page! 🎯**

