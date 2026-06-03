"use client";

import { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Resume {
  id: string;
  name: string;
  fileName: string;
  fileData?: string;
  status: "parsing" | "ready" | "error";
  size: string;
  uploadTime: string;
}

interface Props {
  resume: Resume | null;
  onClose: () => void;
}

export default function ResumePreview({ resume, onClose }: Props) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useState(() => {
    if (resume?.fileData) {
      // 简单显示base64内容预览
      const data = resume.fileData || "";
      setContent(data.substring(0, 1000) + "...");
      setLoading(false);
    } else {
      setLoading(false);
    }
  });

  if (!resume) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8">
      <Card className="max-w-4xl w-full">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{resume.name}</h2>
            <Button onClick={onClose} variant="outline">关闭</Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
              {content || "简历内容"}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
