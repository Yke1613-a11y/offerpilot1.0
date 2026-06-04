"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Target,
  Wand2,
  ClipboardList,
  Settings,
  Loader2,
  Sparkles,
  History,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { isVerified } from "@/lib/invite";

// 存储键
const WORK_RECORDS_KEY = "offerpilot_work_records";
const WORK_PROFILE_KEY = "offerpilot_work_profile";

interface WorkRecord {
  id: string;
  company: string;
  position: string;
  date: string;
  rawContent: {
    what: string;
    why: string;
    problem?: string;
    solution?: string;
    result: string;
  };
  translation: string;
  createdAt: string;
}

interface WorkProfile {
  company: string;
  position: string;
}

export default function WorkPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 用户信息
  const [profile, setProfile] = useState<WorkProfile>({
    company: "",
    position: "",
  });
  
  // 今日记录表单
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [result, setResult] = useState("");
  
  // 翻译结果
  const [translating, setTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<string | null>(null);
  
  // 历史记录
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // 保存profile
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (!isVerified()) {
      router.push("/invite");
      return;
    }
    setAuthorized(true);
    
    // 加载数据
    const savedProfile = localStorage.getItem(WORK_PROFILE_KEY);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    const savedRecords = localStorage.getItem(WORK_RECORDS_KEY);
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    
    setLoading(false);
  }, [router]);

  const saveProfile = () => {
    localStorage.setItem(WORK_PROFILE_KEY, JSON.stringify(profile));
    setEditingProfile(false);
  };

  const handleTranslate = async () => {
    if (!what.trim()) {
      alert("请填写做的事情");
      return;
    }

    setTranslating(true);
    setTranslationResult(null);

    try {
      const response = await fetch("/api/work/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          what,
          why,
          problem,
          solution,
          result,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTranslationResult(data.data.translation);
      } else {
        alert(data.error || "翻译失败");
      }
    } catch (err) {
      console.error("翻译失败:", err);
      alert("网络错误，请重试");
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveRecord = () => {
    if (!what.trim()) {
      alert("请填写做的事情");
      return;
    }

    const record: WorkRecord = {
      id: Date.now().toString(),
      company: profile.company,
      position: profile.position,
      date: new Date().toLocaleDateString("zh-CN"),
      rawContent: {
        what,
        why,
        problem,
        solution,
        result,
      },
      translation: translationResult || "",
      createdAt: new Date().toISOString(),
    };

    const updated = [record, ...records];
    setRecords(updated);
    localStorage.setItem(WORK_RECORDS_KEY, JSON.stringify(updated));

    // 清空表单
    setWhat("");
    setWhy("");
    setProblem("");
    setSolution("");
    setResult("");
    setTranslationResult(null);

    alert("记录已保存！");
  };

  const handleDeleteRecord = (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;
    
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem(WORK_RECORDS_KEY, JSON.stringify(updated));
  };

  const handleCopyTranslation = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已复制到剪贴板！");
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
            <Link href="/dashboard/work" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" /><span>Work翻译器</span>
            </Link>
            <Link href="/dashboard/jd" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
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
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Work 翻译器</h1>
            <p className="text-gray-600">记录日常工作，AI 帮你翻译成简历可用的表达</p>
          </div>

          {/* 用户信息设置 */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">基本信息</h2>
              <button
                onClick={() => editingProfile ? saveProfile() : setEditingProfile(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {editingProfile ? "保存" : "编辑"}
              </button>
            </div>
            
            {editingProfile ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">公司名称</label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                    placeholder="如：字节跳动"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">岗位</label>
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile({...profile, position: e.target.value})}
                    placeholder="如：产品经理实习生"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                {profile.company || "未设置"} · {profile.position || "未设置"}
                <span className="text-gray-400 text-sm ml-2">（编辑后可自动填充）</span>
              </p>
            )}
          </div>

          {/* 记录表单 */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">今日记录</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  做了什么 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  placeholder="今天完成了什么具体任务？"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">为什么做</label>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder="做这件事的背景或目的是什么？"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">遇到的问题（可选）</label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="遇到了什么困难？"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">如何解决（可选）</label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="你是怎么解决的？"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最终结果</label>
                <input
                  type="text"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="产出了什么？有什么数据？（没有可不填，AI会推测）"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleTranslate}
                  disabled={translating || !what.trim()}
                  className="flex-1"
                >
                  {translating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI翻译中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI翻译
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSaveRecord}
                  disabled={!what.trim()}
                  variant="outline"
                >
                  保存记录
                </Button>
              </div>
            </div>
          </div>

          {/* 翻译结果 */}
          {translationResult && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">翻译结果</h2>
                <button
                  onClick={() => handleCopyTranslation(translationResult)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" /> 复制
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border">
                {translationResult}
              </pre>
            </div>
          )}

          {/* 历史记录 */}
          <div className="bg-white rounded-lg border">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold">历史记录</h2>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                  {records.length} 条
                </span>
              </div>
              {showHistory ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {showHistory && (
              <div className="px-6 pb-6">
                {records.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无记录</p>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div key={record.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-medium">
                              {record.company || "未设置公司"} · {record.position || "未设置岗位"}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">{record.date}</span>
                          </div>
                          <div className="flex gap-2">
                            {record.translation && (
                              <button
                                onClick={() => handleCopyTranslation(record.translation)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <p><strong>做什么：</strong>{record.rawContent.what}</p>
                          {record.rawContent.why && (
                            <p><strong>为什么：</strong>{record.rawContent.why}</p>
                          )}
                          {record.rawContent.result && (
                            <p><strong>结果：</strong>{record.rawContent.result}</p>
                          )}
                        </div>
                        
                        {record.translation && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500 mb-1">翻译结果</p>
                            <pre className="text-sm whitespace-pre-wrap bg-white p-3 rounded border">
                              {record.translation}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}