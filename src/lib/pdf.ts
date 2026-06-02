// 简单的PDF文本提取
// 用于提取简历文本内容

export async function extractTextFromPDF(fileData: string): Promise<string> {
  try {
    // fileData是base64编码的PDF文件
    // 这里简化处理，实际项目中可以用pdfjs-dist库
    const base64Data = fileData.split(',')[1] || fileData;
    
    // 返回提示信息，实际项目中应该用pdf.js解析PDF
    return `[PDF文件已上传，内容解析需要配置PDF解析库]`;
  } catch (error) {
    console.error('PDF解析失败:', error);
    return '';
  }
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isPDFFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

export function isDOCXFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === 'docx';
}
