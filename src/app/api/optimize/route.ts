import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId, resumeName, resumeContent, jdContent, jdTitle, company, internships, artifacts } = body;

    if (!jdContent) {
      return Response.json(
        { success: false, error: "请提供JD内容" },
        { status: 400 }
      );
    }

    if (!resumeContent) {
      return Response.json(
        { success: false, error: "请先上传简历，简历内容为空无法优化" },
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

    const prompt = `你是专业的简历优化师，专门帮助用户优化简历以提高求职成功率。

## 原始简历内容（必须完整优化，不能遗漏任何部分）
${resumeContent}

## 目标岗位信息
- 岗位名称：${jdTitle || "未指定"}
- 公司名称：${company || "未指定"}

## 目标JD要求
${jdContent}

## 优化要求（请严格遵守）
1. 【真实性】只优化表达方式，**绝对不能编造虚假内容**

2. 【关键词嵌入】根据JD要求，嵌入相关关键词提升ATS通过率

3. 【量化成果】将模糊描述改为具体数据

4. 【STAR法则】对于工作经历和项目经验，使用STAR法则：
   - S（Situation）背景
   - T（Task）任务
   - A（Action）行动
   - R（Result）结果，用数据说话

## 输出格式要求（严格按照以下格式输出）

### 基本信息（横排一行）
姓名 | 求职意向 | 年龄 | 所在地 | 手机号 | 邮箱

### 教育背景
时间 学校 · 专业（学历）
主修：课程1、课程2...

### 实习经历（每个实习下4个bullet，格式：「**关键词**：动作1、动作2、动作3，结果+数据」）
时间｜公司 岗位
- **关键词1**：动作1、动作2、动作3，结果+数据
- **关键词2**：动作1、动作2、动作3，结果+数据
- **关键词3**：动作1、动作2、动作3，结果+数据
- **关键词4**：动作1、动作2、动作3，结果+数据

【格式说明】每个bullet格式：「**关键词**：动作1、动作2、动作3，结果+数据」
- 连贯的人话，动作和结果自然衔接
- 不刻意追求多个动作，根据实际情况灵活调整
- 关键词要突出技能点或成就

### 项目经验（每个项目下4个bullet）
项目名称 | 时间
- **关键词1**：动作1、动作2、动作3，结果+数据
- **关键词2**：动作1、动作2、动作3，结果+数据
- **关键词3**：动作1、动作2、动作3，结果+数据
- **关键词4**：动作1、动作2、动作3，结果+数据

### 技能特长（5条，分点格式）
- 类别1：具体技能1、具体技能2
- 类别2：具体技能3...

### 自我评价（一段话，不分bullet，3-5句连贯的话）

## 重要提醒
- 必须优化**所有部分**，包括：基本信息、教育背景、实习经历、项目经验、技能特长、自我评价
- 每个实习/项目下必须有4个bullet point
- bullet格式：「**关键词**：动作1、动作2、动作3，结果+数据」，连贯的人话，不刻意追求多个动作
- 如果原始简历某部分为空，可以跳过该部分
- 输出内容应该结构清晰、易于阅读

现在请开始优化这份简历，输出完整的优化结果：`;

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
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API错误:", errorText);
      return Response.json(
        { success: false, error: "API调用失败" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return Response.json(
        { success: false, error: "API返回为空" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: { optimizedResume: result },
    });

  } catch (error) {
    console.error("优化失败:", error);
    return Response.json(
      { success: false, error: "优化失败，请稍后重试" },
      { status: 500 }
    );
  }
}