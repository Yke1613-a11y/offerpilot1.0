"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Target,
  Wand2,
  ClipboardList,
  Settings,
  Loader2,
  Plus,
  Sparkles,
  Languages,
} from "lucide-react";
import { JDAnalysisPanel } from "@/components/jd/jd-analysis-panel";
import { JD_STORAGE_KEY } from "@/lib/storage-keys";

interface JDHistory {
  id: string;
  title: string;
  company: string;
  content: string;
  createdAt: string;
}

interface AnalysisResult {
  overall_score: number;
  skill_score: number;
  experience_score: number;
  keyword_score: number;
  keywords: any[];
  skills: any[];
  requirements: any[];
  ats_keywords: string[];
  suggestions: string[];
}

export default function JDAnalysisPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [jdTitle, setJdTitle] = useState("");
  const [jdContent, setJdContent] = useState("");
  const [jdCompany, setJdCompany] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [jdHistory, setJdHistory] = useState<JDHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jdContent.trim()) {
      alert("请输入岗位描述");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/jd/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdContent: jdContent,
          jdTitle: jdTitle,
          company: jdCompany,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        
        // 保存到历史
        const newJD: JDHistory = {
          id: Date.now().toString(),
          title: jdTitle || "未命名岗位",
          company: jdCompany || "",
          content: jdContent,
          createdAt: new Date().toLocaleString("zh-CN"),
        };
        const updatedHistory = [newJD, ...jdHistory];
        setJdHistory(updatedHistory);
        localStorage.setItem(JD_STORAGE_KEY, JSON.stringify(updatedHistory));
      } else {
        setError(data.error || "分析失败");
      }
    } catch (err) {
      console.error("分析失败:", err);
      setError("网络错误，请检查连接后重试");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setJdTitle("");
    setJdContent("");
    setJdCompany("");
    setAnalysisResult(null);
    setError(null);
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
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <FileText className="h-5 w-5" /><span>工作台</span>
            </Link>
            <Link href="/dashboard/resumes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <FileText className="h-5 w-5" /><span>简历管理</span>
            </Link>
            <Link href="/dashboard/work" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <Sparkles className="h-5 w-5" /><span>Work翻译器</span>
            </Link>
            <Link href="/dashboard/jd" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600">
              <Target className="h-5 w-5" /><span>JD分析</span>
            </Link>
            <Link href="/dashboard/optimize" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <Wand2 className="h-5 w-5" /><span>简历优化</span>
            </Link>
            <Link href="/dashboard/interview" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <ClipboardList className="h-5 w-5" /><span>面试准备</span>
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <Settings className="h-5 w-5" /><span>设置</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">游</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">游客用户</div>
              <div className="text-xs text-gray-500">体验模式</div>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full">返回首页</Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">JD分析</h1>
              <p className="text-gray-600">粘贴岗位描述，AI智能分析关键词和匹配度</p>
            </div>
            <Button onClick={handleNewAnalysis}>
              <Plus className="h-4 w-4 mr-2" />新建分析
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jdTitle">岗位名称</Label>
                      <Input id="jdTitle" value={jdTitle} onChange={(e) => setJdTitle(e.target.value)} placeholder="产品经理、前端工程师" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jdCompany">公司名称</Label>
                      <Input id="jdCompany" value={jdCompany} onChange={(e) => setJdCompany(e.target.value)} placeholder="字节跳动、腾讯" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jdContent">岗位描述</Label>
                    <textarea
                      id="jdContent"
                      value={jdContent}
                      onChange={(e) => setJdContent(e.target.value)}
                      placeholder="粘贴完整的岗位描述信息..."
                      className="w-full h-80 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
                  )}

                  <Button onClick={handleAnalyze} disabled={analyzing || !jdContent.trim()} className="w-full" size="lg">
                    {analyzing ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" />AI分析中（使用MiniMax）... </>
                    ) : (
                      <><Sparkles className="h-5 w-5 mr-2" />开始分析 </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-semibold mb-4">💡 分析技巧</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 粘贴完整的岗位描述效果更好</li>
                  <li>• 包含越多细节，分析越准确</li>
                  <li>• 建议分析后进行简历优化</li>
                  <li>• 匹配度80%以上为优秀</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h3 className="font-semibold mb-4">✅ 当前状态</h3>
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    使用 <strong>MiniMax AI</strong> 进行分析
                  </p>
                  <p className="text-xs text-green-600">智能语义理解，准确率更高</p>
                </div>
              </div>
            </div>
          </div>

          {analysisResult && (
            <div className="mt-8">
              <JDAnalysisPanel result={analysisResult} jdTitle={jdTitle} company={jdCompany} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
