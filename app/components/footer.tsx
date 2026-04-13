import Link from "next/link";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Virtual Keyboard</h3>
            <p>A boutique experience for mechanical keyboard enthusiasts.</p>
          </div>
          <div className="footer-section">
            <h4>Liên Kết</h4>
            <ul>
              <li>
                <Link href="/">Trang Chủ</Link>
              </li>
              <li>
                <Link href="#about">Về Chúng Tôi</Link>
              </li>
              <li>
                <Link href="#contact">Liên Hệ</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Pháp Lý</h4>
            <ul>
              <li>
                <Link href="#privacy">Chính Sách Bảo Mật</Link>
              </li>
              <li>
                <Link href="#terms">Điều Khoản Sử Dụng</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Kết Nối</h4>
            <p>Subscribe to our newsletter for exclusive first access.</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="btn-subscribe">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Virtual Keyboard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

