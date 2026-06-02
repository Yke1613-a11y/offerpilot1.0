"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Target,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Check,
  ArrowRight,
  Upload,
  ClipboardList,
  Wand2,
  Download,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">OfferPilot</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                功能
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                定价
              </Link>
              <Link href="/help" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                帮助
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/dashboard/jd">
                <Button>立即体验</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            让每一份简历，精准击中HR的心
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI智能分析 + 简历优化 + 面试预测，一站式求职辅助
            <br />
            专为大学生、应届生、实习生打造
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/jd">
              <Button size="lg" className="w-full sm:w-auto">
                立即体验 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                观看演示
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" /> 无需注册
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" /> 无需信用卡
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" /> 5分钟快速上手
            </span>
          </div>
        </div>
      </section>

      {/* Pain Points & Solutions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">还在为这些问题烦恼吗？</h2>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">😔</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">海投简历却石沉大海</h3>
                      <p className="text-gray-600 text-sm">
                        用同一份简历投递100个岗位，每投递一个都像是抽奖
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">😞</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">简历投出后没有回音</h3>
                      <p className="text-gray-600 text-sm">
                        每天刷新邮箱，却总是失望，怀疑自己是不是不够优秀
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🤔</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">不知道哪里出了问题</h3>
                      <p className="text-gray-600 text-sm">
                        明明学历不错、经历也丰富，为什么就是没有面试机会
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8">OfferPilot帮你解决</h2>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">智能分析JD关键词</h3>
                      <p className="text-gray-600 text-sm">
                        深入理解每个岗位的要求，精准提取关键词和核心能力
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">ATS友好简历优化</h3>
                      <p className="text-gray-600 text-sm">
                        不编造经历，只优化表达，让优秀被看见
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">面试问题提前准备</h3>
                      <p className="text-gray-600 text-sm">
                        AI预测面试问题，助你自信应对每一场面试
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" id="demo">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">三步获得精准简历</h2>
            <p className="text-gray-600">简单易懂的流程，让求职更高效</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">上传简历</h3>
              <p className="text-sm text-gray-600">支持PDF和Word格式</p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">粘贴JD</h3>
              <p className="text-sm text-gray-600">输入目标岗位描述</p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AI优化</h3>
              <p className="text-sm text-gray-600">一键生成优化简历</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            准备好获得你的 Dream Offer 了吗？
          </h2>
          <p className="text-gray-600 mb-8">
            立即开始，让AI成为你求职路上的得力助手
          </p>
          <Link href="/dashboard/jd">
            <Button size="lg">
              立即开始体验 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2024 OfferPilot. 保留所有权利。
        </div>
      </footer>
    </div>
  );
}
