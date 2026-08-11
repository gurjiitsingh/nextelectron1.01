"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, TsignUpSchema } from "@/lib/types/userType";
import { addUserDirect } from "@/app/(universal)/action/user/dbOperation";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TsignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmitUserRegister = async (data: TsignUpSchema) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await addUserDirect(formData);
    if (result) {
      router.push("/user");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>
      <form onSubmit={handleSubmit(onSubmitUserRegister)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            {...register("username")}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your username"
          />
          {errors.username?.message && (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your email"
          />
          {errors.email?.message && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your password"
          />
          {errors.password?.message && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full border rounded px-3 py-2"
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword?.message && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Register
        </button>
      </form>

      <p className="text-sm text-center mt-6">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Login here
        </a>
      </p>
    </div>
  );
}
