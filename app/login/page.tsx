"use client";

import TopNav from "@/app/components/top-nav";
import LoginForm from "@/app/components/login-form";
import Footer from "@/app/components/footer";

export default function LoginPage() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

