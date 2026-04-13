"use client";

import TopNav from "@/app/components/top-nav";
import SignupForm from "@/app/components/signup-form";
import Footer from "@/app/components/footer";

export default function SignupPage() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <SignupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

