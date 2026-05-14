# 📋 Cập nhật Màn Inventory - Dùng Filter API

## ✅ Những thay đổi đã thực hiện

### 1. **Thay đổi Import**
```typescript
// Cũ
import { getAllProductsAPI } from '@/app/services/productService';

// Mới
import { filterProductsAPI, ProductSearchRequest } from '@/app/services/productService';
```

### 2. **Thêm State cho Search & Filter**
```typescript
const [searchName, setSearchName] = useState('');
const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
const [currentPage, setCurrentPage] = useState(0);
```

### 3. **Cập nhật Hàm fetchProducts**
```typescript
const fetchProducts = async (page: number = 0) => {
  try {
    setIsLoadingProducts(true);
    const searchRequest: ProductSearchRequest = {
      name: searchName || undefined,
      categoryId: selectedCategory || undefined,
    };
    
    const response = await filterProductsAPI(searchRequest, page, 20);
    setProducts((response.content || []) as Product[]);
    setCurrentPage(page);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    toast.error('Lỗi khi tải danh sách sản phẩm');
  } finally {
    setIsLoadingProducts(false);
  }
};
```

### 4. **Thêm Handler Functions**
- `handleSearch()`: Xử lý form submit tìm kiếm
- `handleCategoryFilter()`: Xử lý thay đổi danh mục

### 5. **Thêm Search & Filter Form**
```jsx
<section className="mb-8 bg-white p-6 rounded-lg border border-outline-variant/10 shadow-sm space-y-4">
  <form onSubmit={handleSearch} className="flex gap-4 flex-wrap items-end">
    {/* Input tìm kiếm tên sản phẩm */}
    {/* Select danh mục */}
    {/* Nút tìm kiếm & xóa bộ lọc */}
  </form>
</section>
```

---

## 🎯 Tính năng

### ✨ Tìm kiếm theo tên sản phẩm
- Input text để nhập tên sản phẩm
- Auto-detect từ khóa

### ✨ Lọc theo danh mục
- Select dropdown với các danh mục:
  - Tất cả danh mục
  - Keyboards (ID: 1)
  - Switches (ID: 2)
  - Keycaps (ID: 3)
  - Accessories (ID: 4)
- Tự động lọc khi chọn danh mục

### ✨ Nút Tìm kiếm
- Gửi form và gọi `filterProductsAPI`
- Hiển thị loading state
- Disabled khi đang loading

### ✨ Nút Xóa bộ lọc
- Xoá tất cả giá trị search
- Reset lại danh sách sản phẩm

---

## 📊 API được sử dụng

```
POST /api/products/filter?page=0&size=20
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "categoryId": 1 (optional),
  "sortBy": "string (optional)"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "content": [...],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 50,
    "totalPages": 3
  }
}
```

---

## 🔄 Luồng hoạt động

```
User nhập tên / chọn danh mục
         ↓
Nhấp "Tìm kiếm"
         ↓
Form submit → handleSearch()
         ↓
fetchProducts(0) với searchRequest
         ↓
filterProductsAPI() gửi POST request
         ↓
Backend xử lý filter
         ↓
Trả về danh sách sản phẩm
         ↓
setProducts() cập nhật state
         ↓
Table render danh sách mới
```

---

## 🎨 UI Elements

### Search Input
- Placeholder: "Nhập tên sản phẩm..."
- Width: flex-1, min-width 48px
- Border: `border-outline-variant`
- Focus state: `focus:border-secondary focus:ring-1 focus:ring-secondary`

### Category Select
- Placeholder: "Tất cả danh mục"
- Options: 4 danh mục
- Styling tương tự input

### Buttons
- **Tìm kiếm**: Primary color, icon + text
  - Disabled khi `isLoadingProducts`
- **Xóa bộ lọc**: Border style, hover bg-surface-container

### Loading State
- Spinner khi `isLoadingProducts = true`
- Animated loading indicator

---

## 🔍 Ví dụ sử dụng

### 1. Tìm kiếm sản phẩm theo tên
```
Input: "Neo98"
Request: { name: "Neo98", categoryId: undefined }
Result: Tất cả sản phẩm có tên chứa "Neo98"
```

### 2. Lọc theo danh mục
```
Select: "Keyboards" (ID: 1)
Request: { name: undefined, categoryId: 1 }
Result: Tất cả keyboard products
```

### 3. Kết hợp tìm kiếm + lọc
```
Input: "Pro"
Select: "Keyboards"
Request: { name: "Pro", categoryId: 1 }
Result: Tất cả keyboard có tên chứa "Pro"
```

### 4. Xóa bộ lọc
```
Nhấp "Xóa bộ lọc"
→ setSearchName('') 
→ setSelectedCategory(undefined)
→ setCurrentPage(0)
→ fetchProducts(0)
Result: Load lại tất cả sản phẩm (trang 1)
```

---

## 📱 Responsive Design

- Desktop: Form nằm ngang, full width
- Tablet: Form có thể wrap sang dòng mới
- Mobile: Form stack vertical

---

## ⚠️ Lưu ý quan trọng

1. **Page Size**: Set cứng là 20 sản phẩm/trang
   ```typescript
   const response = await filterProductsAPI(searchRequest, page, 20);
   ```

2. **Default Values**: 
   - `name`: undefined (tìm tất cả nếu rỗng)
   - `categoryId`: undefined (lọc tất cả nếu rỗng)

3. **Search là Case-Insensitive**: Backend xử lý

4. **Loading Disabled**: Nút submit bị disable khi đang load

---

## 🧪 Test Scenarios

### Scenario 1: Search by Name
1. Nhập "Pro" vào search input
2. Nhấp "Tìm kiếm"
3. ✅ Kết quả chỉ hiển thị sản phẩm có tên chứa "Pro"

### Scenario 2: Filter by Category
1. Chọn "Switches" từ dropdown
2. ✅ Tự động lọc, chỉ hiển thị switches

### Scenario 3: Combined Search & Filter
1. Nhập "Hot"
2. Chọn "Keyboards"
3. ✅ Hiển thị keyboards có tên chứa "Hot"

### Scenario 4: Clear Filters
1. Sau khi search
2. Nhấp "Xóa bộ lọc"
3. ✅ Quay về danh sách đầy đủ

---

## 🔧 Nếu muốn bổ sung

### Thêm Sorting
```typescript
const [sortBy, setSortBy] = useState<string | undefined>();

// Trong request
{
  name: searchName || undefined,
  categoryId: selectedCategory || undefined,
  sortBy: sortBy || undefined
}
```

### Thêm Pagination UI
```typescript
// Hiển thị pagination buttons
// Prev / Page 1, 2, 3 / Next
```

### Thêm Advanced Filters
```typescript
const [priceMin, setPriceMin] = useState<number | undefined>();
const [priceMax, setPriceMax] = useState<number | undefined>();
const [stockOnly, setStockOnly] = useState(false);
```

---

**Hoàn tất! ✅ Màn Inventory giờ đã dùng Filter API thay vì Get All API.**

