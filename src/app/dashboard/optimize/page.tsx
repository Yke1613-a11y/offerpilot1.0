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
  artifactIds?: string[];
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
  const [newJdConfirmed, setNewJdConfirmed] = useState(false);
  const [showNewJdInput, setShowNewJdInput] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [internships, setInternships] = useState<Internship[]>([]);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [polishingInternship, setPolishingInternship] = useState(false);
  const [internshipPolished, setInternshipPolished] = useState(false);
  const [newInternship, setNewInternship] = useState<Partial<Internship>>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  const [artifacts, setArtifacts] = useState<WorkArtifact[]>([]);
  const [draftArtifactIds, setDraftArtifactIds] = useState<string[]>([]);
  const [materialCandidates, setMaterialCandidates] = useState<string[]>([]);
  const [adoptedMaterialCandidates, setAdoptedMaterialCandidates] = useState<string[]>([]);
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

  const updateNewInternship = (updates: Partial<Internship>) => {
    setNewInternship({ ...newInternship, ...updates });
    setInternshipPolished(false);
    setMaterialCandidates([]);
    setAdoptedMaterialCandidates([]);
  };

  const handleAdoptMaterialCandidate = (candidate: string) => {
    const currentDescription = newInternship.description?.trim() || "";
    setNewInternship({
      ...newInternship,
      description: currentDescription ? `${currentDescription}\n- ${candidate}` : `- ${candidate}`,
    });
    setAdoptedMaterialCandidates([...adoptedMaterialCandidates, candidate]);
  };

  const handlePolishInternship = async () => {
    if (!newInternship.company || !newInternship.description) {
      alert("请先填写实习公司和工作内容");
      return;
    }

    setPolishingInternship(true);

    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      const response = await fetch("/api/optimize/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newInternship,
          resumeContent: selectedResume?.fileData || "",
          artifacts: artifacts.filter(artifact => draftArtifactIds.includes(artifact.id)),
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "AI 润色失败");
      }

      setNewInternship({
        ...newInternship,
        description: data.data.optimizedDescription,
      });
      setMaterialCandidates(data.data.materialCandidates || []);
      setAdoptedMaterialCandidates([]);
      setInternshipPolished(true);
    } catch (error: any) {
      alert(error.message || "AI 润色失败，请稍后重试");
    } finally {
      setPolishingInternship(false);
    }
  };

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
      description: newInternship.description || "",
      artifactIds: draftArtifactIds,
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
    setDraftArtifactIds([]);
    setMaterialCandidates([]);
    setAdoptedMaterialCandidates([]);
    setInternshipPolished(false);

    alert("实习经历已添加！");
  };

  const handleDeleteInternship = (id: string) => {
    if (!confirm("确定要删除这条实习经历吗？")) return;
    
    const internship = internships.find(i => i.id === id);
    const updated = internships.filter(i => i.id !== id);
    const updatedArtifacts = artifacts.filter(a => !internship?.artifactIds?.includes(a.id));
    setInternships(updated);
    setArtifacts(updatedArtifacts);
    localStorage.setItem(INTERNSHIPS_KEY, JSON.stringify(updated));
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(updatedArtifacts));
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
      setDraftArtifactIds([...draftArtifactIds, artifact.id]);
      setMaterialCandidates([]);
      setAdoptedMaterialCandidates([]);
      localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(updated));

      alert(`辅助工作材料 "${file.name}" 上传成功！\n内容长度：${fileContent.length} 字符`);
      
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
    setDraftArtifactIds(draftArtifactIds.filter(artifactId => artifactId !== id));
    setMaterialCandidates([]);
    setAdoptedMaterialCandidates([]);
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(updated));
  };

  const handleOptimize = async () => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    const selectedJd = jdHistory.find(j => j.id === selectedJdId);
    const jdText = selectedJd?.content || (newJdConfirmed ? newJdContent : "");

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
            <Link href="/dashboard/work" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <Sparkles className="h-5 w-5" />
              <span>Work翻译器</span>
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                          setNewJdConfirmed(false);
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
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        newJdConfirmed
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-dashed border-gray-300 hover:border-blue-400 text-blue-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {newJdConfirmed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Plus className="h-5 w-5" />
                        )}
                        <span>{newJdConfirmed ? "已使用粘贴的新JD（点击修改）" : "粘贴新JD"}</span>
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
                      onChange={e => {
                        setNewJdContent(e.target.value);
                        setNewJdConfirmed(false);
                      }}
                      placeholder="粘贴岗位描述..."
                      className="w-full h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={() => {
                          setNewJdContent(newJdContent.trim());
                          setNewJdConfirmed(true);
                          setShowNewJdInput(false);
                        }}
                        disabled={!newJdContent.trim()}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        确认使用此JD
                      </Button>
                    </div>
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
                    简历还没更新？先写下最近一段实习的工作内容和成果，AI 会整理成可直接放入简历的表达。
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
                              {intern.artifactIds && intern.artifactIds.length > 0 && (
                                <div className="text-xs text-purple-700 mt-3 flex items-center gap-1">
                                  <File className="h-3.5 w-3.5" />
                                  已附加 {intern.artifactIds.length} 份辅助工作材料
                                </div>
                              )}
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
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="实习公司"
                          value={newInternship.company}
                          onChange={e => updateNewInternship({company: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="岗位（如：产品经理实习生）"
                          value={newInternship.position}
                          onChange={e => updateNewInternship({position: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="开始时间（如：2024.06）"
                          value={newInternship.startDate}
                          onChange={e => updateNewInternship({startDate: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="结束时间（如：2024.09）"
                          value={newInternship.endDate}
                          onChange={e => updateNewInternship({endDate: e.target.value})}
                          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <textarea
                        placeholder="简单写下工作碎片即可，例如：KOC/KOL 达人筛选、建联、Brief 审核、视频审核、投放支持。AI 会整理成专业话术，并用 XX 留出量化位置..."
                        value={newInternship.description}
                        onChange={e => updateNewInternship({description: e.target.value})}
                        className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-purple-900">辅助工作材料（可选）</h4>
                          <p className="text-xs text-purple-700 mt-1">
                            上传表格、Word、策划案、brief 或复盘材料。AI 会帮你发现可能遗漏的工作模块，生成可选候选要点。
                          </p>
                        </div>
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                          提示：材料内容会发送给 MiniMax。请先删除客户隐私、商业机密等敏感信息。
                        </p>
                        {draftArtifactIds.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {artifacts
                              .filter(artifact => draftArtifactIds.includes(artifact.id))
                              .map(artifact => (
                                <div key={artifact.id} className="bg-white p-3 rounded-lg border border-purple-200">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 min-w-0">
                                      <File className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <div className="font-medium text-purple-800 text-sm truncate">
                                          {artifact.fileName}
                                        </div>
                                        <div className="text-xs text-purple-600 mt-1">
                                          {artifact.size} · 已提取 {artifact.content.length} 字符
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteArtifact(artifact.id)}
                                      className="text-red-500 hover:text-red-700"
                                      aria-label={`删除 ${artifact.fileName}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                        <input
                          ref={artifactInputRef}
                          type="file"
                          accept=".pdf,.docx,.xlsx,.xls,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,text/plain"
                          onChange={(e) => handleArtifactUpload(e.target.files)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => artifactInputRef.current?.click()}
                          disabled={uploadingArtifact}
                          className="w-full border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-400 hover:bg-purple-100 transition-all disabled:opacity-60"
                        >
                          {uploadingArtifact ? (
                            <span className="flex items-center justify-center text-sm text-purple-700">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              正在提取材料内容...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center text-sm text-purple-700">
                              <Upload className="h-4 w-4 mr-2" />
                              添加辅助工作材料
                            </span>
                          )}
                        </button>
                        <p className="text-xs text-purple-600 mt-2 text-center">
                          支持 PDF、DOCX、XLSX、TXT
                        </p>
                      </div>
                      {internshipPolished && (
                        <div className="space-y-3">
                          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                            AI 已根据你填写的文字整理完成。你可以继续修改，确认无误后添加到本次优化材料。
                          </p>
                          {materialCandidates.length > 0 && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                              <h4 className="text-sm font-medium text-amber-900">从材料中提炼的候选要点</h4>
                              <p className="text-xs text-amber-700 mt-1 mb-3">
                                这些内容不会自动进入简历。请确认确实属于你的工作，再逐条采纳并修改。
                              </p>
                              <ul className="space-y-2">
                                {materialCandidates.map((candidate, index) => (
                                  <li key={`${candidate}-${index}`} className="text-xs text-amber-900 bg-white rounded border border-amber-200 p-3">
                                    <p>{candidate}</p>
                                    <button
                                      type="button"
                                      onClick={() => handleAdoptMaterialCandidate(candidate)}
                                      disabled={adoptedMaterialCandidates.includes(candidate)}
                                      className="mt-2 text-amber-800 font-medium hover:text-amber-950 disabled:text-green-700 disabled:cursor-default"
                                    >
                                      {adoptedMaterialCandidates.includes(candidate) ? "✓ 已采纳" : "+ 采纳到编辑框"}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      <Button
                        onClick={handlePolishInternship}
                        className="w-full"
                        variant="outline"
                        disabled={polishingInternship}
                      >
                        {polishingInternship ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {polishingInternship ? "AI 正在整理..." : "AI 润色为简历表达"}
                      </Button>
                      <Button onClick={handleAddInternship} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        确认添加到优化材料
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <Button
                onClick={handleOptimize}
                disabled={!selectedResumeId || (!selectedJdId && !newJdConfirmed) || optimizing}
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
                <li>• 保留真实数据，突出成果和价值</li>
                <li>• 如果简历缺少经历，可以补充实习信息并附加工作材料</li>
                <li>• 不编造虚假内容，只优化表达方式</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
