"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn, getSession } from "next-auth/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  FaBoxOpen,
  FaChartLine,
  FaStore,
  FaReceipt,
  FaCandyCane,
} from "react-icons/fa";

const SignIn = () => {
  const [error, setError] = useState("");

  async function submitHandler(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setError("");

  const formData = new FormData(
    event.currentTarget
  );

  const email = formData.get(
    "email"
  ) as string;

  const password = formData.get(
    "password"
  ) as string;

  const res = await signIn(
    "credentials",
    {
      email,
      password,
      redirect: false,
    }
  );

  if (res?.error) {
    setError("Invalid email or password");
    return;
  }

  // Read the newly created NextAuth session
  const session = await getSession();

  console.log("SESSION:", session);

  switch (session?.user?.role) {
    case "admin":
      window.location.href = "/admin";
      break;

    case "driver":
      window.location.href = "/driver";
      break;

    case "chef":
      window.location.href = "/chef";
      break;

    case "storeKeeper":
      window.location.href = "/storeKeeper";
      break;

    default:
      window.location.href = "/";
      break;
  }
}

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/login-bg.jpg"
        alt="Samrat Sweets ERP"
        fill
        priority
        className="object-cover scale-105"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/65" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(245,158,11,0.25),rgba(0,0,0,0.88))]" />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/70" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      {/* Glow Effects */}
      <div className="absolute top-24 left-10 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />

      <div className="absolute bottom-24 right-20 h-72 w-72 rounded-full bg-yellow-500/20 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-between gap-12 px-6 py-10 lg:flex-row lg:px-12">
        {/* Left Side */}
        <div className="max-w-2xl pt-20 text-white lg:pt-0">
          {/* Badge */}
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-amber-400">
            <FaCandyCane />
            Smart ERP Platform
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
            Manage Your
            <span className="block text-amber-400">
                Business
            </span>
            Smarter
          </h1>

          {/* Description */}
          <p className="mb-8 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Manage inventory,
            production, billing,
            purchases, accounting,
            staff and branch
            operations with one
            powerful ERP platform
            built for Business.
          </p>

          {/* Features */}
      <div className="mb-10 flex flex-wrap gap-6 text-sm text-white/90">

  <div className="flex items-center gap-2">
    <FaBoxOpen className="text-amber-400" />
    Inventory Management
  </div>

  <div className="flex items-center gap-2">
    <FaReceipt className="text-amber-400" />
    Billing & Sales
  </div>

  {/* <div className="flex items-center gap-2">
    <FaStore className="text-amber-400" />
    Multi Branch Support
  </div> */}

  <div className="flex items-center gap-2">
    <FaChartLine className="text-amber-400" />
    Business Analytics
  </div>

  <div className="flex items-center gap-2">
    🍮 Recipe Management
  </div>

  <div className="flex items-center gap-2">
    🧾 Production Planning
  </div>

  <div className="flex items-center gap-2">
    🏭 Manufacturing Tracking
  </div>

  <div className="flex items-center gap-2">
    📦 Raw Material Management
  </div>

  {/* <div className="flex items-center gap-2">
    ⚖️ Batch & Lot Tracking
  </div> */}

  <div className="flex items-center gap-2">
    🛒 Purchase Management
  </div>

  <div className="flex items-center gap-2">
    🚚 Supplier Management
  </div>

  <div className="flex items-center gap-2">
    👨‍🍳 Production Costing
  </div>

  {/* <div className="flex items-center gap-2">
    📅 Expiry Management
  </div> */}

  <div className="flex items-center gap-2">
    👥 Staff Management
  </div>

  <div className="flex items-center gap-2">
    💰 Expense Tracking
  </div>

  <div className="flex items-center gap-2">
    📈 Profit & Loss Reports
  </div>

  <div className="flex items-center gap-2">
    💳 GST & Tax Management
  </div>

  <div className="flex items-center gap-2">
    📱 POS Integration
  </div>

  <div className="flex items-center gap-2">
    🎁 Customer Loyalty Program
  </div>

  <div className="flex items-center gap-2">
    📲 WhatsApp Notifications
  </div>

  <div className="flex items-center gap-2">
    🔐 Role Based Access Control
  </div>

</div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/features"
              className="rounded-full bg-amber-500 px-8 py-3 font-semibold text-white shadow-2xl transition hover:bg-amber-600"
            >
              Explore Modules
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-8 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            Samrat Sweets ERP
          </h2>

          <p className="mb-8 text-center text-sm text-white/70">
            Sign in to access your
            dashboard
          </p>

          <form
            onSubmit={submitHandler}
            className="space-y-5"
          >
            {error && (
              <p className="text-center text-sm text-red-400">
                {error}
              </p>
            )}

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm text-white/80">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                required
                defaultValue="g1@mail.com"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-white/80">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-amber-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                type="password"
                name="password"
                required
                defaultValue="123456"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-6 text-base font-semibold text-white hover:bg-amber-600"
            >
              Sign In
            </Button>
          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-white/70">
            Need an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-amber-400 hover:underline"
            >
              Contact Administrator
            </Link>
          </p>
        </Card>
      </div>

      {/* Floating Business Card */}
      <div className="absolute bottom-8 right-6 hidden items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-2xl backdrop-blur-lg md:flex lg:right-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
          <FaChartLine className="text-amber-400" />
        </div>

        <div className="text-white">
          <p className="font-semibold">
            Real-Time Business
            Insights
          </p>

          <p className="text-xs text-white/70">
            Monitor sales, stock
            and production live
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignIn;