"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Target, Wand2, ClipboardList, Settings, Loader2, Sparkles, Plus, CheckCircle, ArrowRight, Trash2, ChevronDown, ChevronUp, Upload, File } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Resume {
  id: string;
  name: string;
  fileName: string;
  fileData?: string;
  fileType: string;
  size: string;
  uploadTime: string;
  status: string;
}

interface JDHistory {
  id: string;
  title: string;
  company: string;
  content: string;
  createdAt: string;
}

interface Internship {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface WorkArtifact {
  id: string;
  fileName: string;
  fileType: string;
  content: string;
  size: string;
  uploadTime: string;
}

const RESUMES_KEY = "offerpilot_resumes_v4";
const JD_KEY = "offerpilot_jd_history";
const INTERNSHIPS_KEY = "offerpilot_internships";
const ARTIFACTS_KEY = "offerpilot_artifacts";

export default function OptimizePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jdHistory, setJdHistory] = useState<JDHistory[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [newJdContent, setNewJdContent] = useState("");
  const [showNewJdInput, setShowNewJdInput] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [internships, setInternships] = useState<Internship[]>([]);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [newInternship, setNewInternship] = useState<Partial<Internship>>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  const [artifacts, setArtifacts] = useState<WorkArtifact[]>([]);
  const [showArtifactsForm, setShowArtifactsForm] = useState(false);
  const [uploadingArtifact, setUploadingArtifact] = useState(false);
  const artifactInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedResumes = localStorage.getItem(RESUMES_KEY);
    if (savedResumes) {
      try {
        setResumes(JSON.parse(savedResumes));
      } catch (e) {
        console.error("读取简历失败:", e);
      }
    }

    const savedJds = localStorage.getItem(JD_KEY);
    if (savedJds) {
      try {
        setJdHistory(JSON.parse(savedJds));
      } catch (e) {
        console.error("读取JD失败:", e);
      }
    }

    const savedInternships = localStorage.getItem(INTERNSHIPS_KEY);
    if (savedInternships) {
      try {
        setInternships(JSON.parse(savedInternships));
      } catch (e) {
        console.error("读取实习经历失败:", e);
      }
    }

    const savedArtifacts = localStorage.getItem(ARTIFACTS_KEY);
    if (savedArtifacts) {
      try {
        setArtifacts(JSON.parse(savedArtifacts));
      } catch (e) {
        console.error("读取工作成果失败:", e);
      }
    }

    setLoading(false);
  }, []);

  // 添加实习经历
  const handleAddInternship = () => {
    if (!newInternship.company || !newInternship.description) {
      alert("请填写公司和具体工作内容");
      return;
    }

    const internship: Internship = {
      id: Date.now().toString(),
      company: newInternship.company || "",
      position: newInternship.position || "",
      startDate: newInternship.startDate || "",
      endDate: newInternship.endDate || "",
      description: newInternship.description || ""
    };

    const updated = [internship, ...internships];
    setInternships(updated);
    localStorage.setItem(INTERNSHIPS_KEY, JSON.stringify(updated));

    setNewInternship({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    });

    alert("实习经历已添加！");
  };

  const handleDeleteInternship = (id: string) => {
    if (!confirm("确定要删除这条实习经历吗？")) return;
    
    const updated = internships.filter(i => i.id !== id);
    setInternships(updated);
    localStorage.setItem(INTERNSHIPS_KEY, JSON.stringify(updated));
  };

  // 提取PDF文本
  const extractPDFText = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }
    
    return fullText.trim();
  };

  // 提取Word文本
  const extractWordText = async (file: File): Promise<string> => {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // 提取Excel文本
  const extractExcelText = async (file: File): Promise<string> => {
    const XLSX = await import("xlsx");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let fullText = "";
    
    workbook.SheetNames.forEach((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      fullText += `=== 工作表: ${sheetName} ===\n${csv}\n\n`;
    });
    
    return fullText.trim();
  };

  // 读取TXT文本
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // 上传工作成果文件
  const handleArtifactUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingArtifact(true);

    try {
      const file = files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      let fileContent = "";
      
      if (fileExtension === 'pdf') {
        fileContent = await extractPDFText(file);
      } else if (fileExtension === 'docx') {
        fileContent = await extractWordText(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        fileContent = await extractExcelText(file);
      } else if (file.type === 'text/plain' || fileExtension === 'txt') {
        fileContent = await readTextFile(file);
      } else {
        alert("不支持的文件格式，请上传 PDF、DOCX、XLSX 或 TXT 文件");
        setUploadingArtifact(false);
        return;
      }

      if (!fileContent || fileContent.trim().length === 0) {
        alert("文件内容为空，无法提取有效文本");
        setUploadingArtifact(false);
        return;
      }

      const artifact: WorkArtifact = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: file.type || (fileExtension === 'pdf' ? 'application/pdf' : 'text/plain'),
        content: fileContent,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadTime: new Date().toLocaleString("zh-CN"),
      };

      const updated = [artifact, ...artifacts];
      setArtifacts(updated);
      localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(updated));

      alert(`工作成果 "${file.name}" 上传成功！\n内容长度：${fileContent.length} 字符`);
      
      if (artifactInputRef.current) {
        artifactInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("上传失败:", error);
      alert("上传失败：" + (error.message || "未知错误"));
    } finally {
      setUploadingArtifact(false);
    }
  };

  const handleDeleteArtifact = (id: string) => {
    if (!confirm("确定要删除这个工作成果吗？")) return;
    
    const updated = artifacts.filter(a => a.id !== id);
    setArtifacts(updated);
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(updated));
  };

  const handleOptimize = async () => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    const selectedJd = jdHistory.find(j => j.id === selectedJdId);
    const jdText = selectedJd?.content || newJdContent;

    if (!selectedResume) {
      setError("请先选择简历");
      return;
    }

    if (!jdText) {
      setError("请选择JD或粘贴新的JD内容");
      return;
    }

    setOptimizing(true);
    setError(null);
    setOptimizedContent(null);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResume.id,
          resumeName: selectedResume.name,
          resumeContent: selectedResume.fileData || "",
          jdContent: jdText,
          jdTitle: selectedJd?.title || "新岗位",
          company: selectedJd?.company || "",
          internships: internships,
          artifacts: artifacts,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOptimizedContent(data.data.optimizedResume);
      } else {
        setError(data.error || "优化失败");
      }
    } catch (err) {
      console.error("优化失败:", err);
      setError("网络错误，请重试");
    } finally {
      setOptimizing(false);
    }
  };

  const handleCopy = () => {
    if (optimizedContent) {
      navigator.clipboard.writeText(optimizedContent);
      alert("已复制到剪贴板！");
    }
  };

  if (loading) {
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
              <FileText className="h-5 w-5" />
              <span>工作台</span>
            </Link>
            <Link href="/dashboard/resumes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <FileText className="h-5 w-5" />
              <span>简历管理</span>
            </Link>
            <Link href="/dashboard/jd" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <Target className="h-5 w-5" />
              <span>JD分析</span>
            </Link>
            <Link href="/dashboard/optimize" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600">
              <Wand2 className="h-5 w-5" />
              <span>简历优化</span>
            </Link>
            <Link href="/dashboard/interview" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <ClipboardList className="h-5 w-5" />
              <span>面试准备</span>
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
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
            <Button variant="outline" className="w-full">返回首页</Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">简历优化</h1>
            <p className="text-gray-600">选择简历和JD，AI使用STAR法则优化表达，提升简历通过率</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Selection */}
            <div className="space-y-6">
              {/* Resume Selection */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">1. 选择简历</h3>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  {resumes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-4">还没有上传简历</p>
                      <Link href="/dashboard/resumes">
                        <Button variant="outline">去上传简历</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resumes.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedResumeId(r.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedResumeId === r.id 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              selectedResumeId === r.id ? "border-blue-500 bg-blue-500" : "border-gray-300"
                            }`}>
                              {selectedResumeId === r.id && (
                                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{r.name}</div>
                              <div className="text-sm text-gray-500">{r.fileName} · {r.size}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* JD Selection */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">2. 选择JD</h3>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    {jdHistory.map(j => (
                      <button
                        key={j.id}
                        onClick={() => {
                          setSelectedJdId(j.id);
                          setShowNewJdInput(false);
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedJdId === j.id 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            selectedJdId === j.id ? "border-blue-500 bg-blue-500" : "border-gray-300"
                          }`}>
                            {selectedJdId === j.id && (
                              <div className="h-2.5 w-2.5 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{j.title}</div>
                            <div className="text-sm text-gray-500">{j.company} · {j.createdAt}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => {
                        setSelectedJdId(null);
                        setShowNewJdInput(true);
                      }}
                      className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 text-blue-600 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Plus className="h-5 w-5" />
                        <span>粘贴新JD</span>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* New JD Input */}
              {showNewJdInput && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">粘贴JD内容</h3>
                    <textarea
                      value={newJdContent}
                      onChange={e => setNewJdContent(e.target.value)}
                      placeholder="粘贴岗位描述..."
                      className="w-full h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </CardContent>
                </Card>
              )}

              {/* 补充实习经历 */}
              <Card>
                <CardContent className="p-6">
                  <div 
                    className="flex items-center justify-between mb-4 cursor-pointer"
                    onClick={() => setShowInternshipForm(!showInternshipForm)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">3. 补充实习经历（可选）</h3>
                      {internships.length > 0 && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                          已添加 {internships.length} 条
                        </span>
                      )}
                    </div>
                    {showInternshipForm ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    如果你的简历缺少实习经历，可以在这里补充，AI会结合补充内容进行优化
                  </p>

                  {internships.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {internships.map(intern => (
                        <div key={intern.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-blue-800">
                                {intern.company} {intern.position && `· ${intern.position}`}
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                {intern.startDate} - {intern.endDate || "至今"}
                              </div>
                              <div className="text-sm text-gray-700 mt-2">
                                {intern.description}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteInternship(intern.id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showInternshipForm && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="实习公司"
                          value={newInternship.company}
                          onChange={e => setNewInternship({...newInternship, company: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="岗位（如：产品经理实习生）"
                          value={newInternship.position}
                          onChange={e => setNewInternship({...newInternship, position: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="开始时间（如：2024.06）"
                          value={newInternship.startDate}
                          onChange={e => setNewInternship({...newInternship, startDate: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="结束时间（如：2024.09）"
                          value={newInternship.endDate}
                          onChange={e => setNewInternship({...newInternship, endDate: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <textarea
                        placeholder="具体工作内容和成就（请详细描述，这样AI能更好地帮你优化）..."
                        value={newInternship.description}
                        onChange={e => setNewInternship({...newInternship, description: e.target.value})}
                        className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button onClick={handleAddInternship} className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        添加实习经历
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 工作成果库 */}
              <Card>
                <CardContent className="p-6">
                  <div 
                    className="flex items-center justify-between mb-4 cursor-pointer"
                    onClick={() => setShowArtifactsForm(!showArtifactsForm)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">4. 实习成果库（可选）</h3>
                      {artifacts.length > 0 && (
                        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded">
                          已上传 {artifacts.length} 个文件
                        </span>
                      )}
                    </div>
                    {showArtifactsForm ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    上传实习期间的工作成果文件（策划案、数据报告、方案文档等），AI会自动提取内容来丰富你的简历
                  </p>

                  {artifacts.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {artifacts.map(artifact => (
                        <div key={artifact.id} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 flex-1">
                              <File className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-purple-800 text-sm">
                                  {artifact.fileName}
                                </div>
                                <div className="text-xs text-purple-600 mt-1">
                                  {artifact.size} · {artifact.uploadTime}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  内容长度：{artifact.content.length} 字符
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteArtifact(artifact.id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showArtifactsForm && (
                    <div className="pt-4 border-t">
                      <input
                        ref={artifactInputRef}
                        type="file"
                        accept=".pdf,.docx,.xlsx,.xls,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,text/plain"
                        onChange={(e) => handleArtifactUpload(e.target.files)}
                        className="hidden"
                      />
                      
                      {uploadingArtifact ? (
                        <div className="flex flex-col items-center py-8">
                          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-3" />
                          <p className="text-sm text-gray-600">正在提取文件内容...</p>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                          onClick={() => artifactInputRef.current?.click()}
                        >
                          <Upload className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                          <p className="text-sm text-purple-600 font-medium">
                            点击上传工作成果文件
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            支持 PDF、DOCX、XLSX、TXT 格式（营销策划、数据报告等）
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <Button
                onClick={handleOptimize}
                disabled={!selectedResumeId || (!selectedJdId && !newJdContent) || optimizing}
                className="w-full"
                size="lg"
              >
                {optimizing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    AI优化中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    开始优化
                  </>
                )}
              </Button>
            </div>

            {/* Right Column - Result */}
            <Card>
              <CardContent className="p-6 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">优化结果</h3>
                  {optimizedContent && (
                    <Button onClick={handleCopy} size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      复制结果
                    </Button>
                  )}
                </div>
                
                {optimizing ? (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>AI正在优化中...</p>
                  </div>
                ) : optimizedContent ? (
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed h-96 overflow-auto">
                    {optimizedContent}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <Wand2 className="h-16 w-16 text-gray-300 mb-4" />
                    <p>选择简历和JD后点击"开始优化"</p>
                    <p className="text-sm mt-2">AI将使用STAR法则优化表达</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-2">💡 优化说明</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• 基于简历内容和JD进行STAR法则优化</li>
                <li>• 嵌入关键词，提升ATS通过率</li>
                <li>• 量化成果，突出数据和价值</li>
                <li>• 如果简历缺少经历，可以补充实习信息和上传工作成果</li>
                <li>• 不编造虚假内容，只优化表达方式</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}