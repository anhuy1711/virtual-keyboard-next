"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import { logoutAPI, getAccessToken, getUserProfile, updateUserInfo, updatePassword } from "@/app/services/authService";
import "./account.css";

interface User {
  id?: string;
  username: string;
  email: string;
  phone?: string;
  fullName?: string;
  address?: string;
  birthday?: string;
  role?: string;
  isActive?: boolean;
}

interface Order {
  id: string;
  date: string;
  items: number;
  total: string;
  status: "DELIVERED" | "PENDING" | "CANCELLED";
}

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
    address: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      items: 3,
      total: "$1,299.99",
      status: "DELIVERED",
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      items: 2,
      total: "$599.50",
      status: "PENDING",
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      items: 1,
      total: "$249.99",
      status: "DELIVERED",
    },
  ];

  useEffect(() => {
    // Mark component as mounted on client
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted on client
    if (!isMounted) return;

    const loadUserProfile = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("Vui lòng đăng nhập để truy cập trang này");
          router.push("/login");
          return;
        }

        // Fetch full user profile from backend
        const userProfile = await getUserProfile();
        setUser(userProfile);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load profile:", error);
        
        // Fallback: try to use localStorage data
        const userDataStr = localStorage.getItem("user");
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            setUser(userData);
          } catch (e) {
            toast.error("Không thể tải thông tin profile");
            router.push("/login");
          }
        } else {
          toast.error("Không thể tải thông tin profile");
          router.push("/login");
        }
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [isMounted, router]);

  const handleLogout = () => {
    logoutAPI();
    toast.success("Đã đăng xuất thành công!");
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const handleEditProfile = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        address: user.address || "",
      });
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.fullName || !formData.email) {
      toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsUpdating(true);

    try {
      const updated = await updateUserInfo(formData);
      setUser(updated);
      setIsEditMode(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Cập nhật thất bại";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = () => {
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsChangingPassword(true);

    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Đổi mật khẩu thành công!");
      handleClosePasswordModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại";
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleViewOrderDetails = (orderId: string) => {
    toast.info(`Xem chi tiết đơn hàng ${orderId}`);
  };

  if (isLoading) {
    return (
      <>
        <TopNav />
        <div className="loading-container">
          <p>Đang tải...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <TopNav />
      <main className="account-container">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{user.fullName}</h3>
              <p className="profile-tier">Premium Member</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </button>
            <button
              className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fas fa-box"></i>
              <span>Orders</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="account-content">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <section className="tab-content">
              <div className="content-header">
                <h1>Profile</h1>
              </div>

              <div className="profile-section">
                {!isEditMode ? (
                  <>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Họ và Tên</label>
                        <p>{user.fullName || "Chưa cập nhật"}</p>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <p>{user.email}</p>
                      </div>
                      <div className="info-item">
                        <label>Số điện thoại</label>
                        <p>{user.phone || "Chưa cập nhật"}</p>
                      </div>
                      <div className="info-item">
                        <label>Ngày sinh</label>
                        <p>{user.birthday || "Chưa cập nhật"}</p>
                      </div>
                      <div className="info-item full-width">
                        <label>Địa chỉ</label>
                        <p>{user.address || "Chưa cập nhật"}</p>
                      </div>
                      <div className="info-item">
                        <label>Username</label>
                        <p>{user.username}</p>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button className="btn btn-primary" onClick={handleEditProfile}>
                        Sửa profile
                      </button>
                      <button className="btn btn-secondary" onClick={handleUpdatePassword}>
                        Đổi mật khẩu
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-grid">
                      <div className="form-group">
                        <label>Họ và Tên *</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleFormChange("fullName", e.target.value)}
                          placeholder="Họ và tên"
                          className="input-field"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFormChange("email", e.target.value)}
                          placeholder="Email"
                          className="input-field"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleFormChange("phone", e.target.value)}
                          placeholder="Số điện thoại"
                          className="input-field"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="form-group">
                        <label>Ngày sinh</label>
                        <input
                          type="date"
                          value={formData.birthday}
                          onChange={(e) => handleFormChange("birthday", e.target.value)}
                          className="input-field"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Địa chỉ</label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => handleFormChange("address", e.target.value)}
                          placeholder="Địa chỉ"
                          className="input-field"
                          rows={3}
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="btn btn-primary" 
                        onClick={handleSaveProfile}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <section className="tab-content">
              <div className="content-header">
                <h1>Order History</h1>
                <p>Xem và theo dõi các đơn hàng trước đây của bạn.</p>
              </div>

              <div className="orders-section">
                {mockOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <p className="order-id">{order.id}</p>
                        <p className="order-date">{order.date}</p>
                      </div>
                      <span
                        className={`order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status === "DELIVERED"
                          ? "Đã giao"
                          : order.status === "PENDING"
                            ? "Đang xử lý"
                            : "Đã hủy"}
                      </span>
                    </div>
                    <div className="order-details">
                      <p>
                        <strong>Items:</strong> {order.items}
                      </p>
                      <p>
                        <strong>Total:</strong> {order.total}
                      </p>
                    </div>
                    <button
                      className="btn-view-order"
                      onClick={() => handleViewOrderDetails(order.id)}
                    >
                      Xem chi tiết
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={handleClosePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đổi mật khẩu</h2>
              <button className="modal-close" onClick={handleClosePasswordModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordFormChange("currentPassword", e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="input-field"
                  disabled={isChangingPassword}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordFormChange("newPassword", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="input-field"
                  disabled={isChangingPassword}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordFormChange("confirmPassword", e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  className="input-field"
                  disabled={isChangingPassword}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleClosePasswordModal}
                disabled={isChangingPassword}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

