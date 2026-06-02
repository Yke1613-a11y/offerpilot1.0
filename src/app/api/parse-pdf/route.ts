import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "没有上传文件" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件太大" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (file.type === "text/plain") {
      const text = buffer.toString("utf-8");
      return NextResponse.json({
        success: true,
        data: {
          content: text,
          type: "text"
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: "PDF解析需要使用前端pdf.js"
    }, { status: 400 });

  } catch (error) {
    console.error("文件处理失败:", error);
    return NextResponse.json(
      { error: "文件处理失败" },
      { status: 500 }
    );
  }
}