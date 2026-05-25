"use client";

import { useState, useEffect, useCallback } from "react";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {updateCartItemQuantityAPI} from "@/app/services/cartService";

interface CartItemOption {
  name: string;
  value: string;
}

interface CartItem {
  id: number;
  skuId: number;
  productId: number;
  productName: string;
  image?: string;
  price: number;
  quantity: number;
  options: CartItemOption[];
}

interface CartResponse {
  id: number;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

interface ApiResponse<T> {
  code: number;
  data: T;
}

const API_BASE = "http://localhost:8080";

const SHIPPING_COSTS: Record<string, number> = {
  standard: 0,
  express: 25,
  international: 45,
};

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const router = useRouter();
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({});
  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const handleQuantityInputChange = (itemId: number, value: string) => {
    // Cho phép xoá trắng input
    if (value === '') {
      setQuantityInputs((prev) => ({
        ...prev,
        [itemId]: '',
      }));
      return;
    }

    // Chỉ cho nhập số
    if (!/^\d+$/.test(value)) return;

    setQuantityInputs((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleQuantityInputBlur = (itemId: number, currentQuantity: number) => {
    const rawValue = quantityInputs[itemId];

    // Nếu xoá trắng rồi blur thì trả về quantity cũ
    if (!rawValue) {
      setQuantityInputs((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      return;
    }

    const newQuantity = Math.max(1, Number(rawValue));

    if (newQuantity !== currentQuantity) {
      updateQuantity(itemId, newQuantity);
    }

    setQuantityInputs((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken"); // ← "accessToken" không phải "token"
      const res = await fetch(`${API_BASE}/cart/my-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // ← gắn vào header
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json: ApiResponse<CartResponse> = await res.json();
      if (json.code !== 200) throw new Error(`API error: code ${json.code}`);

      setCart(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1 || !cart) return;

    const oldCart = cart;

    try {
      setCart((prev) => {
        if (!prev) return prev;

        const newItems = prev.items.map((item) =>
            item.id === cartItemId
                ? { ...item, quantity: newQuantity }
                : item
        );

        const newTotalPrice = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        return {
          ...prev,
          items: newItems,
          totalPrice: newTotalPrice,
        };
      });

      await updateCartItemQuantityAPI(cartItemId, newQuantity);
    } catch (error) {
      setCart(oldCart);

      toast.error(
          error instanceof Error
              ? error.message
              : "Cập nhật số lượng thất bại"
      );
    }
  };

  const removeItem = async (id: number) => {
    if (!cart) return;
    const removed = cart.items.find((item) => item.id === id);
    if (!removed) return;

    // Optimistic UI
    setCart({
      ...cart,
      items: cart.items.filter((item) => item.id !== id),
      totalItems: cart.totalItems - removed.quantity,
      totalPrice: cart.totalPrice - removed.price * removed.quantity,
    });

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`http://localhost:8080/cart/delete/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json.code !== 200) throw new Error(`API error: ${json.code}`);

    } catch (err) {
      console.error("Error removing item:", err);
      // Rollback nếu API thất bại
      fetchCart();
    }
  };

  const cartItems = cart?.items ?? [];
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = SHIPPING_COSTS[shippingMethod];
  const discount = discountApplied ? Math.floor(subtotal * 0.1) : 0;
  const tax = Math.round((subtotal + shipping - discount) * 0.1 * 100) / 100;
  const total = subtotal + shipping - discount + tax;

  const applyDiscount = () => {
    if (discountCode.trim().length > 0) setDiscountApplied(true);
  };

  if (loading) {
    return (
        <>
          <TopNav />
          <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-32">
            <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
              progress_activity
            </span>
            </div>
          </main>
          <Footer />
        </>
    );
  }

  if (error) {
    return (
        <>
          <TopNav />
          <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-error mb-4 block">
              error
            </span>
              <p className="text-on-surface-variant text-lg mb-6">{error}</p>
              <button
                  onClick={fetchCart}
                  className="text-primary font-bold hover:underline flex items-center gap-2 mx-auto"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Thử lại
              </button>
            </div>
          </main>
          <Footer />
        </>
    );
  }

  return (
      <>
      <TopNav />
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-16">
          <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-4 block">
            Sản phẩm bạn chọn
          </span>
          <h1 className="text-5xl font-extrabold tracking-tighter text-primary">
            Giỏ hàng
          </h1>
        </div>

        {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-on-surface-variant text-lg mb-4">
                Giỏ hàng của bạn trống
              </p>
              <a href="/products" className="text-primary font-bold hover:underline">
                Tiếp tục mua sắm
              </a>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              {/* Cart Items List */}
              <div className="lg:col-span-8 space-y-12">
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col md:flex-row gap-8 items-start pb-8 border-b border-outline-variant/15"
                    >
                      {/* Product Image */}
                      <div className="w-full md:w-48 aspect-square bg-surface-container-low rounded overflow-hidden flex-shrink-0">
                        <img
                            alt={item.productName}
                            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                            src={item.image}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold tracking-tight text-on-surface">
                              {item.productName}
                            </h3>
                            <p className="text-sm text-on-surface-variant font-body mt-1">
                              {item.options.map((opt) => `${opt.name}: ${opt.value}`).join(" / ")}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-primary tracking-tight">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-8 mt-6">
                          <div className="flex items-center bg-surface-container rounded p-1 border border-outline-variant/10">
                            <button
                                type="button"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>

                            <input
                                type="text"
                                inputMode="numeric"
                                value={quantityInputs[item.id] ?? String(item.quantity)}
                                onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                                onBlur={() => handleQuantityInputBlur(item.id, item.quantity)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                className="w-12 h-8 text-center bg-transparent border-none outline-none font-bold text-sm text-on-surface"
                            />

                            <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>

                          <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs uppercase tracking-widest font-bold text-on-surface-variant hover:text-error transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                ))}

                {/* Cart Navigation */}
                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  {/* ✅ FIX: thẻ <a> bị mất ở đây */}

                  <a
                      href="/products"
                      className="text-sm font-bold text-primary group flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
                    west
                  </span>
                  Tiếp tục mua hàng
                </a>
              </div>
            </div>

        {/* Summary Sidebar */}
          <div className="lg:col-span-4 sticky top-32">
          <div className="bg-surface-container-low p-8 rounded-xl shadow-sm border border-outline-variant/10">
          <h2 className="text-2xl font-bold tracking-tight text-primary">
          Tổng cộng
          </h2>

          <div className="space-y-6">

        {/* Shipping */}

        {/* Price Breakdown */}
        <div className="pt-2 space-y-3">
          {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Giảm giá (10%)</span>
                <span className="font-bold text-secondary">
                          -{discount.toFixed(2)}
                        </span>
              </div>
          )}
          <div className="flex justify-between items-end pb-6 border-t border-outline-variant/20 pt-4">
            <div className="text-right">
              <span className="text-3xl font-extrabold text-primary tracking-tighter">
                          {formatCurrency(subtotal) }
                        </span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button onClick={() => router.push('/checkout')} className="w-full py-5 bg-primary text-on-primary rounded font-bold text-sm uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300">
          Thanh toán
        </button>
      </div>

      {/* Shipping Info */}

      {/* Payment Methods */}
      </div>
</div>
</div>
)}
</main>
  <Footer />
</>
);
}
