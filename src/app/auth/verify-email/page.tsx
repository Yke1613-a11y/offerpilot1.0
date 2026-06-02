"use client";

import Link from "next/link";
import { Mail, Sparkles, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold">OfferPilot</span>
        </Link>

        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">验证邮箱</h1>
          <p className="text-gray-600 mb-6">
            我们已发送验证邮件到你的邮箱，请查收并点击邮件中的链接完成验证。
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              如果你没有收到邮件，请检查垃圾邮件文件夹，或点击下方按钮重新发送。
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login">
              <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                返回登录
              </button>
            </Link>
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              重新发送邮件
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          收不到邮件？
          <Link href="/help" className="text-blue-600 hover:underline">
            查看帮助
          </Link>
        </p>
      </div>
    </div>
  );
}
