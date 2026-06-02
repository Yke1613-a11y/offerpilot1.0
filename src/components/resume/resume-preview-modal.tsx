"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
} from "lucide-react";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeName: string;
  fileName: string;
  fileUrl?: string;
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  resumeName,
  fileName,
  fileUrl,
}: ResumePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom((prev) => prev + 25);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom((prev) => prev - 25);
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold">{resumeName}</h2>
              <p className="text-sm text-gray-500">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 w-16 text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            {fileUrl && (
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          {fileUrl ? (
            <div className="h-full flex justify-center">
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="bg-white shadow-lg transition-transform"
                style={{
                  width: `${(595 * zoom) / 100}px`,
                  height: `${(842 * zoom) / 100}px`,
                }}
                onLoad={() => setLoading(false)}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">暂无预览内容</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">1 / 1</span>
            <Button variant="outline" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            按 ESC 或点击外部区域关闭预览
          </p>
        </div>
      </div>
    </div>
  );
}
