import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { what, why, problem, solution, result } = body;

    if (!what) {
      return Response.json(
        { success: false, error: "请填写做的事情" },
        { status: 400 }
      );
    }

    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      return Response.json({
        success: false,
        error: "请配置MINIMAX_API_KEY",
      }, { status: 500 });
    }

    const prompt = `你是一个专业的简历优化师。请根据用户提供的日常工作记录，翻译成简历可用的表达。

## 用户输入
- 做了什么：${what}
- 为什么做：${why || '未填写'}
- 遇到的问题：${problem || '未填写'}
- 如何解决：${solution || '未填写'}
- 最终结果：${result || '未填写'}

## 输出格式（严格按照以下格式，bullet格式：「**关键词**：动作与结果」）

### 简历表达版本
根据用户提供的信息，输出一段专业的简历描述，使用「**关键词**：动作与结果」格式，每条 bullet 包含关键词和连贯的动作结果描述。

### STAR版本
用STAR法则重新组织：
- S（Situation）背景：
- T（Task）任务：
- A（Action）行动：
- R（Result）结果：

### 数据建议
基于用户描述，推测可能的数据指标，用「XX」表示需要用户补充的位置。

## Bullet格式要求
- 格式：「**关键词**：动作与用户明确提供的结果」
- 连贯的人话
- 关键词要突出技能点或成就
- 不能编造数字，用XX表示需要补充的位置
- 2-4个bullet，根据真实信息灵活调整

现在请翻译：`;

    const response = await fetch("https://api.minimax.chat/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "abab6.5s-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API错误:", errorText);
      return Response.json(
        { success: false, error: "API调用失败，请稍后重试" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result_text = data.choices?.[0]?.message?.content;

    if (!result_text || result_text.trim().length === 0) {
      return Response.json(
        { success: false, error: "AI返回为空，请稍后重试" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: { translation: result_text },
    });

  } catch (error) {
    console.error("翻译失败:", error);
    return Response.json(
      { success: false, error: "翻译失败，请稍后重试" },
      { status: 500 }
    );
  }
}