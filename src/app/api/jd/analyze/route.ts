import { analyzeJDWithMiniMax, analyzeJDLocal } from "@/lib/ai/minimax";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jdContent, jdTitle, company } = body;

    if (!jdContent) {
      return NextResponse.json(
        { error: "缺少岗位描述内容" },
        { status: 400 }
      );
    }

    let result;

    try {
      // 尝试使用MiniMax API
      result = await analyzeJDWithMiniMax(jdContent, jdTitle, company);
    } catch (apiError) {
      console.warn("MiniMax API调用失败，使用本地分析:", apiError);
      // 如果API调用失败，使用本地分析
      result = analyzeJDLocal(jdContent);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("JD分析失败:", error);
    return NextResponse.json(
      { error: "分析失败，请稍后重试" },
      { status: 500 }
    );
  }
}
