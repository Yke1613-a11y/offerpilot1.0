"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Target,
  Wand2,
  Plus,
  ClipboardList,
  History,
  Settings,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">OfferPilot</span>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">工作台</span>
            </Link>
            <Link
              href="/dashboard/resumes"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <FileText className="h-5 w-5" />
              <span>简历管理</span>
            </Link>
            <Link
              href="/dashboard/jd"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Target className="h-5 w-5" />
              <span>JD分析</span>
            </Link>
            <Link
              href="/dashboard/optimize"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Wand2 className="h-5 w-5" />
              <span>简历优化</span>
            </Link>
            <Link
              href="/dashboard/interview"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <ClipboardList className="h-5 w-5" />
              <span>面试准备</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Settings className="h-5 w-5" />
              <span>设置</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
              游
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">游客用户</div>
              <div className="text-xs text-gray-500">体验模式</div>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full">
              返回首页
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-4xl">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}！
            </h1>
            <p className="text-gray-600">
              欢迎使用OfferPilot，开始优化你的简历吧
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-gray-500 text-sm">份简历</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-gray-500 text-sm">次分析</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-gray-500 text-sm">次优化</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
            <div className="grid grid-cols-3 gap-4">
              <Link href="/dashboard/resumes">
                <Button className="h-auto py-6 w-full flex flex-col gap-2" size="lg">
                  <Plus className="h-6 w-6" />
                  <span>上传新简历</span>
                </Button>
              </Link>
              <Link href="/dashboard/jd">
                <Button
                  variant="outline"
                  className="h-auto py-6 w-full flex flex-col gap-2"
                  size="lg"
                >
                  <ClipboardList className="h-6 w-6" />
                  <span>粘贴JD分析</span>
                </Button>
              </Link>
              <Link href="/dashboard/history">
                <Button
                  variant="outline"
                  className="h-auto py-6 w-full flex flex-col gap-2"
                  size="lg"
                >
                  <History className="h-6 w-6" />
                  <span>查看优化历史</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-800 mb-2">💡 体验模式</h3>
            <p className="text-sm text-blue-700">
              当前为游客体验模式，无需注册即可使用JD分析功能。
              配置Supabase后可保存分析记录和享受更多功能。
            </p>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">最近活动</h2>
            <div className="bg-white rounded-xl border">
              <div className="p-8 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无活动记录</p>
                <p className="text-sm mt-2">
                  开始上传简历或分析JD，开启你的求职之旅
                </p>
                <Link href="/dashboard/jd">
                  <Button className="mt-4">
                    立即体验JD分析
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
