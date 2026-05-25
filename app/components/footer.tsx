import Link from "next/link";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <Link href="/" className="footer-brand" aria-label="Clack Keebs">
              <img src="/logo.png" alt="Clack Keebs" className="footer-logo" />
            </Link>
          </div>
          <div className="footer-section">
            <h4>Liên kết</h4>
            <ul>
              <li>
                <Link href="/">Trang chủ</Link>
              </li>
              <li>
                <Link href="#about">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="#contact">Liên hệ</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Pháp lý</h4>
            <ul>
              <li>
                <Link href="#privacy">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link href="#terms">Điều khoản sử dụng</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Kết nối</h4>
            <p>Đăng ký nhận tin để xem ưu đãi và sản phẩm mới sớm nhất.</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="newsletter-input"
              />
              <button className="btn-subscribe">Đăng ký</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Bàn phím ảo. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
}

