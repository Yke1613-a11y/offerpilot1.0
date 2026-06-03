"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Key, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyInviteCode, isVerified, markVerified } from "@/lib/invite";

// 禁用预渲染
export const dynamic = 'force-dynamic';

export default function InvitePage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 检查是否已验证
    if (isVerified()) {
      router.push("/dashboard/jd");
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleVerify = () => {
    setError("");

    if (!inviteCode.trim()) {
      setError("请输入邀请码");
      return;
    }

    const code = inviteCode.trim().toUpperCase();
    if (verifyInviteCode(code)) {
      markVerified(code);
      router.push("/dashboard/jd");
    } else {
      setError("邀请码无效，请联系管理员获取正确的邀请码");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">OfferPilot</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            让每一份简历<br />
            精准击中HR的心
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            AI智能分析 + 简历优化 + 面试预测，一站式求职辅助平台
          </p>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> 数据本地存储
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> 完全免费
            </span>
          </div>
        </div>

        <div className="text-white/40 text-sm">
          © 2024 OfferPilot. All rights reserved.
        </div>
      </div>

      {/* Right Side - Invite Code Input */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">邀请码验证</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">需要邀请码才能访问</h2>
            <p className="text-gray-600">
              为了防止滥用，我们需要邀请码来验证访问权限。<br />
              请联系管理员获取邀请码。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邀请码
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="请输入邀请码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest uppercase"
                maxLength={20}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleVerify}
              className="w-full"
              size="lg"
            >
              验证邀请码
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>已有邀请码？直接输入即可</p>
            <p className="mt-2">
              联系管理员获取：<span className="text-blue-600">admin@offerpilot.com</span>
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              <strong>隐私说明：</strong>邀请码验证只用于防止滥用，<br />
              不会收集或存储任何个人信息。你的数据完全存储在本地。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}