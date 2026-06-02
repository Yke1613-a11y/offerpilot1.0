import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId, resumeName, resumeContent, jdContent, jdTitle, company, internships } = body;

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

## 用户补充的最新实习经历（必须合并进简历，不得遗漏）
${internships?.length
  ? internships.map((internship: {
      company?: string;
      position?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }) => `### ${internship.company || "未填写公司"} ${internship.position || ""}
时间：${internship.startDate || "未填写"} - ${internship.endDate || "至今"}
${internship.description || "未填写工作内容"}`).join("\n\n")
  : "用户未补充新的实习经历"}

## 目标岗位信息
- 岗位名称：${jdTitle || "未指定"}
- 公司名称：${company || "未指定"}

## 目标JD要求
${jdContent}

## 优化要求（请严格遵守）
1. 【真实性】只优化表达方式，**绝对不能编造虚假内容**。原文和补充材料中没有出现的信息必须省略或保留为空，不得自行补全姓名、年龄、所在地、手机号、邮箱、学校、时间、人数、增长率、合作数量等任何事实。

2. 【关键词嵌入】JD 只能用于选择措辞和排序。仅当原始简历或用户确认文本已有对应事实时，才能嵌入相关关键词；不得因为 JD 出现某项职责就新增 bullet、经历或成果。

3. 【量化成果】保留用户已有数据；用户没有提供数据时，不能擅自编造数字，也不能把推测写成事实。

4. 【STAR法则】对于工作经历和项目经验，使用STAR法则：
   - S（Situation）背景
   - T（Task）任务
   - A（Action）行动
   - R（Result）结果，用数据说话

5. 【补充材料】把用户已经确认的最新实习经历合并进简历。每段补充实习的 bullet 数量不得超过用户确认文本中的 bullet 数量，不得改变其中事实或额外扩写职责。

6. 【禁止推断】不得把“发布笔记”自动扩写为“提升曝光度”，不得把“整理复盘表”自动扩写为“提升效率”或“提供数据支持”。只有用户明确写出的结果才能作为成果表述。

7. 【章节边界】补充实习经历只能用于完善对应的“实习经历”。除非原始简历明确存在对应项目，否则不得凭空创建新的“项目经验”。自我评价也只能改写原文已有内容，原文没有自我评价时跳过。

## 输出格式要求（严格按照以下格式输出）

### 基本信息（横排一行，仅保留原文已有字段）
原文已有信息

### 教育背景
时间 学校 · 专业（学历）
原文存在主修课程时才输出主修课程

### 实习经历（每个实习下2-4个bullet，信息不足时宁可少写，格式：「**关键词**：动作与结果」）
时间｜公司 岗位
- **关键词1**：动作与用户明确提供的结果
- **关键词2**：动作与用户明确提供的结果

【格式说明】
- 连贯的人话，动作和结果自然衔接
- 不刻意追求 bullet 数量，根据真实信息灵活调整
- 关键词要突出技能点或成就

### 项目经验（仅当原始简历明确存在项目经验时输出；每个项目下2-4个bullet，信息不足时宁可少写）
项目名称 | 时间
- **关键词1**：动作与用户明确提供的结果
- **关键词2**：动作与用户明确提供的结果

### 技能特长（仅整理原文或补充材料明确出现的技能，分点格式）
- 类别：具体技能

### 自我评价（仅当原始简历存在自我评价时改写；原文没有则跳过）

## 重要提醒
- 必须完整优化原始简历中已有的部分；原文缺失的章节不要输出
- 每个实习/项目根据真实信息输出2-4个bullet point，信息不足时可以少于2个或跳过
- bullet格式：「**关键词**：动作与用户明确提供的结果」，连贯的人话
- 如果原始简历某部分为空，可以跳过该部分
- 不得为了补齐格式而编造任何个人信息、技能、课程、经历、职责或数字
- 原文没有主修课程时不得生成课程；原文没有自我评价时不得生成自我评价
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
        temperature: 0.2,
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

    const cleanedResult = result
      .replace(
        /\n*### (项目经验|自我评价)\s*\n(?:无|[（(][^）)\n]*跳过[^）)\n]*[）)])\s*(?=\n### |$)/g,
        ""
      )
      .replace(
        /\n*### 自我评价(?:（[^）\n]*）|\([^)\n]*\))?\s*(?=\n### |$)/g,
        ""
      )
      .trim();

    return Response.json({
      success: true,
      data: { optimizedResume: cleanedResult },
    });

  } catch (error) {
    console.error("优化失败:", error);
    return Response.json(
      { success: false, error: "优化失败，请稍后重试" },
      { status: 500 }
    );
  }
}
