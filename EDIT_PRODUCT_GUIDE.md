# Hướng dẫn Màn Chỉnh sửa Sản phẩm (Edit Product Page)

## 📋 Tổng quan
Tôi đã tạo hoàn chỉnh màn chỉnh sửa sản phẩm cho bạn. Dưới đây là chi tiết:

## ✨ Các tính năng được thêm

### 1. **File trang Edit Product**
- **Đường dẫn**: `/app/admin/products/[id]/page.tsx`
- **URL khi chạy**: `/admin/products/{id}` (VD: `/admin/products/1`)
- **Chức năng**:
  - Load dữ liệu sản phẩm hiện tại từ backend
  - Chỉnh sửa thông tin cơ bản (tên, mô tả, tóm tắt)
  - Upload ảnh bìa mới
  - Quản lý thông số kỹ thuật (Specifications)
  - Quản lý tùy chọn sản phẩm (Product Options)
  - Quản lý SKU (tạo, chỉnh sửa, xoá)
  - Lưu thay đổi về backend

### 2. **API Service Update**
**File**: `/app/services/productService.ts`

Thêm function mới:
```typescript
export const updateProductAPI = async (
  id: number,
  request: Omit<CreateProductRequest, 'id'>
): Promise<ProductDetailResponse>
```

### 3. **Cập nhật trang Inventory**
**File**: `/app/admin/inventory/page.tsx`

- Thêm Link `Edit` trên từng dòng sản phẩm
- Khi nhấp "Edit" sẽ chuyển hướng đến `/admin/products/{id}`

---

## 🎯 Cách sử dụng

### Truy cập trang chỉnh sửa sản phẩm:
1. Vào trang **Inventory** (`/admin/inventory`)
2. Tìm sản phẩm muốn chỉnh sửa
3. Nhấp icon **Edit** (bút chì) ở cuối dòng
4. Sẽ chuyển đến trang chỉnh sửa

### Trên trang Edit:
1. **Thông tin cơ bản**: Sửa tên, tóm tắt, mô tả
2. **Ảnh bìa**: Kéo/thả hoặc chọn file để upload
3. **Thông số kỹ thuật**:
   - Nhấp "Thêm cặp" để thêm thông số mới
   - Nhập tên và giá trị
   - Nhấp X để xoá
4. **Tùy chọn sản phẩm**:
   - Nhấp "Thêm thuộc tính" để thêm option
   - Nhập loại (VD: "Màu vỏ")
   - Thêm giá trị (VD: "Đen", "Trắng")
   - Nhấp ✓ hoặc Enter để xác nhận giá trị
   - Nhấp X để xoá
   - Nhấp delete icon (góc phải) để xoá toàn bộ option
5. **SKU Management**:
   - Khi thêm options, nhấp "Tạo lại SKU" để tự động tạo tất cả biến thể
   - Chỉnh sửa giá, tồn kho, trạng thái hoạt động
   - Nhấp edit icon để thêm nhãn phụ (VD: "Standard Edition", "Premium Edition")
   - Xoá SKU không cần thiết
6. **Lưu**: Nhấp "Lưu thay đổi" ở cuối trang

---

## 🔒 Bảo mật
- Yêu cầu token JWT hợp lệ
- Chỉ admin có thể truy cập
- Tự động chuyển hướng nếu không có quyền

---

## 🛠️ Cấu trúc dữ liệu được gửi về Backend

Khi nhấp "Lưu thay đổi", sẽ gửi PUT request tới:
```
PUT /api/products/update/{id}
```

**Body**:
```json
{
  "name": "string",
  "description": "string",
  "summary": "string",
  "cover": "string (base64 hoặc URL)",
  "type": "KIT|PREBUILT|KEYCAP|SWITCH",
  "categoryId": 1,
  "specifications": [
    {
      "name": "Layout",
      "value": "98%"
    }
  ],
  "options": [
    {
      "name": "Màu vỏ",
      "values": ["Đen", "Trắng", "Xanh"]
    }
  ],
  "skus": [
    {
      "price": 189.00,
      "quantity": 42,
      "optionValueIndexes": [0, 1]
    }
  ]
}
```

---

## 📝 Ghi chú quan trọng

1. **Image Upload**: 
   - Mặc định sử dụng Base64
   - Backend phải hỗ trợ Base64 hoặc URL

2. **Option Indexes**:
   - `optionValueIndexes` là các chỉ số tương ứng với vị trí giá trị trong mảng options
   - VD: nếu có 2 options (Màu: 3 giá trị, Chất liệu: 3 giá trị)
   - SKU đầu tiên (Đen/Aluminum) sẽ có `[0, 0]`
   - SKU thứ hai (Đen/Brass) sẽ có `[0, 1]`

3. **Validation**:
   - Tên sản phẩm: bắt buộc
   - Ít nhất 1 SKU cần được định nghĩa
   - Giá và tồn kho phải >= 0

---

## 🚀 Tính năng bổ sung có thể thêm

1. Delete product API endpoint
2. Xem preview thay đổi trước khi lưu
3. Undo/Redo chức năng
4. Export product data dưới dạng CSV
5. Bulk edit nhiều sản phẩm cùng lúc
6. History log các thay đổi

---

## 📞 Troubleshooting

**Nếu trang không load dữ liệu:**
1. Kiểm tra URL có chứa ID hợp lệ không
2. Kiểm tra token JWT trong localStorage
3. Mở DevTools → Network để xem chi tiết request

**Nếu lưu không thành công:**
1. Kiểm tra console để xem error message
2. Đảm bảo backend API endpoint tồn tại
3. Kiểm tra dữ liệu được gửi có hợp lệ không

