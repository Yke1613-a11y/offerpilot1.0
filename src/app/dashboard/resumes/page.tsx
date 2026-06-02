"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Loader2, Upload, Trash2, Eye, AlertCircle, CheckCircle, Target, Wand2, ClipboardList, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Resume {
  id: string;
  name: string;
  fileName: string;
  fileData: string;
  fileType: string;
  status: "parsing" | "ready" | "error";
  size: string;
  uploadTime: string;
}

const STORAGE_KEY = "offerpilot_resumes_v4";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setResumes(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error("读取失败:", e);
      setResumes([]);
    }
    setLoading(false);
  };

  const extractPDFText = async (file: File): Promise<string> => {
    try {
      console.log("开始提取PDF内容:", file.name, file.size, "字节");
      
      const pdfjsLib = await import("pdfjs-dist");
      
      console.log("PDF.js 版本:", pdfjsLib.version);
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      
      console.log("设置 worker 路径为:", pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log("文件转为ArrayBuffer，大小:", arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      });
      
      const pdf = await loadingTask.promise;
      console.log("PDF加载成功，总页数:", pdf.numPages);
      
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`正在读取第 ${i}/${pdf.numPages} 页...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        
        fullText += pageText + "\n\n";
        
        console.log(`第 ${i} 页提取完成，长度:`, pageText.length);
      }
      
      console.log("PDF内容提取完成，总长度:", fullText.length);
      return fullText.trim();
    } catch (error: any) {
      console.error("PDF解析失败:", error);
      
      if (error.message?.includes("未安装")) {
        throw new Error("PDF.js 库未安装。请在终端运行：npm install pdfjs-dist，然后重启开发服务器");
      }
      
      throw new Error("PDF解析失败：" + (error.message || "未知错误"));
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      alert("请选择文件");
      return;
    }

    const file = files[0];
    setUploading(true);
    
    console.log("准备上传文件:", file.name, "大小:", file.size, "字节", "类型:", file.type);

    try {
      let fileContent = "";
      let fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

      if (fileExtension === 'pdf') {
        console.log("检测到PDF文件，开始提取文本...");
        fileContent = await extractPDFText(file);
      } else if (file.type === 'text/plain' || fileExtension === 'txt') {
        console.log("检测到TXT文件，使用FileReader读取...");
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || "");
          reader.onerror = () => reject(new Error("文件读取失败"));
          reader.readAsText(file);
        });
      } else {
        throw new Error("不支持的文件格式，请上传 PDF 或 TXT 文件");
      }

      if (!fileContent || fileContent.trim().length === 0) {
        throw new Error("文件内容为空，无法提取有效文本");
      }

      console.log("文件内容提取成功，长度:", fileContent.length);

      const newResume: Resume = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        fileData: fileContent,
        fileType: file.type || (fileExtension === 'pdf' ? 'application/pdf' : 'text/plain'),
        status: "ready",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadTime: new Date().toLocaleString("zh-CN"),
      };

      const updated = [newResume, ...resumes];
      setResumes(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      alert(`简历上传成功！\n文件名：${file.name}\n内容长度：${fileContent.length} 字符\n格式：${fileExtension.toUpperCase()}`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("上传失败:", error);
      alert("上传失败：" + (error.message || "未知错误"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("确定要删除这份简历吗？")) return;
    
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    if (selectedResume?.id === id) {
      setSelectedResume(null);
      setPreviewContent("");
    }
  };

  const handlePreview = (resume: Resume) => {
    setSelectedResume(resume);
    setPreviewContent(resume.fileData || "[简历内容为空]");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">OfferPilot</span>
            </Link>
          </div>
        </div>
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
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
            <Link href="/dashboard/resumes" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" /><span>简历管理</span>
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
        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">简历管理</h1>
              <p className="text-gray-600">上传和管理你的简历，方便后续进行JD分析和优化</p>
            </div>
          </div>

          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">✅ PDF 支持已启用</p>
                  <p className="text-sm text-green-700 mt-1">
                    支持 <strong>PDF</strong> 和 <strong>TXT</strong> 格式文件上传。<br />
                    系统会自动提取文件中的文本内容。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600">正在提取文件内容...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                      点击选择 PDF 或 TXT 文件，或拖拽到此处
                    </p>
                    <p className="text-sm text-gray-500">
                      支持 PDF、TXT 格式，系统自动提取文本内容
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {resumes.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="py-16 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">还没有上传简历</p>
                <p className="text-sm text-gray-400">
                  上传简历后可以进行JD分析和优化
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">已上传简历 ({resumes.length})</h2>
              
              {resumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => handlePreview(resume)}
                      >
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{resume.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{resume.fileName}</span>
                            <span>·</span>
                            <span>{resume.size}</span>
                            <span>·</span>
                            <span>{resume.uploadTime}</span>
                            {resume.fileData && resume.fileData.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-green-600">✓ 已解析</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(resume)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          预览
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resume.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedResume && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50"
          onClick={() => setSelectedResume(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedResume.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedResume.fileName} · {selectedResume.size}
                </p>
              </div>
              <Button onClick={() => setSelectedResume(null)} variant="outline">
                关闭
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {previewContent ? (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-white p-6 rounded-lg border">
                  {previewContent}
                </pre>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">简历内容为空</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}