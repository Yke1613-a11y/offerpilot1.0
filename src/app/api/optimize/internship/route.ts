interface Artifact {
  fileName?: string;
  content?: string;
}

function getSourceItems(description: string) {
  return description
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function sanitizeBullet(bullet: string, source: string) {
  const unsupportedPatterns = [
    /确保/,
    /保证/,
    /提升/,
    /增强/,
    /优化/,
    /品牌标准/,
    /用户参与度/,
    /品牌影响力/,
    /投放效率/,
  ];
  const segments = bullet.split(/[，,]/).map(segment => segment.trim()).filter(Boolean);
  const safeSegments = segments.filter((segment, index) => {
    if (index === 0) return true;
    if (/XX(?:%|\+)/.test(segment)) return true;
    return !unsupportedPatterns.some(pattern => pattern.test(segment) && !pattern.test(source));
  });

  return safeSegments.join("，").replace(/[。；;]+$/, "");
}

function maskMetricValues(bullet: string) {
  return bullet
    .replace(/\d+(?:\.\d+)?\s*%\s*\+?/g, "XX%+")
    .replace(/\d+(?:\.\d+)?\s*\+/g, "XX+")
    .replace(/\d+(?:\.\d+)?(?=\s*(?:家|位|篇|个|次|万|元|人))/g, "XX");
}

function addMetricPlaceholders(bullet: string, source: string) {
  const maskedBullet = maskMetricValues(bullet);
  const bulletWithoutGeneratedMetrics = maskedBullet
    .split(/[，,]/)
    .map(segment => segment.trim())
    .filter(segment => !/XX(?:%|\+)|累计对接达人|上线率|复用率|收藏表现/.test(segment))
    .join("，");

  const placeholders = [];
  if (/复盘|迭代|数据|反馈/.test(source)) {
    placeholders.push("优质达人复用率提升约 XX%+");
  } else if (/brief|脚本|卖点|文案|痛点/i.test(source)) {
    placeholders.push("内容互动及收藏表现提升约 XX%+");
  } else {
    if (/达人|KOC|KOL/i.test(source)) placeholders.push("累计对接达人 XX+");
    if (/投放|内容|视频|发布/.test(source)) placeholders.push("内容按期上线率达 XX%+");
  }

  return placeholders.length > 0
    ? `${bulletWithoutGeneratedMetrics}，${placeholders.slice(0, 2).join("，")}`
    : bulletWithoutGeneratedMetrics;
}

function normalizeRewrite(content: string, description: string) {
  const maxBullets = Math.max(getSourceItems(description).length, 1);
  const bullets = content
    .split("\n")
    .map(line => line.trim())
    .filter(line => /^[-*]\s*/.test(line))
    .map(line => line.replace(/^[-*]\s*/, ""))
    .slice(0, maxBullets)
    .map(line => addMetricPlaceholders(sanitizeBullet(line, description), line));

  return bullets.map(line => `- ${line}。`).join("\n");
}

async function callMiniMax(apiKey: string, prompt: string) {
  const response = await fetch("https://api.minimax.chat/v1/text/chatcompletion_v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "abab6.5s-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1600,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("MiniMax 实习经历润色失败:", errorText);
    throw new Error("AI 润色失败，请稍后重试");
  }

  const content = (await response.json()).choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("AI 返回内容为空，请重试");
  }

  return content;
}

function parseCandidateBullets(content: string) {
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(item => typeof item === "string")
          .map(item => item.trim())
          .filter(Boolean)
          .slice(0, 6);
      }
    } catch (error) {
      console.warn("候选 bullet JSON 解析失败，尝试按行解析:", error);
    }
  }

  return content
    .split("\n")
    .map(line => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, position, startDate, endDate, description, resumeContent, artifacts } = body;

    if (!company || !description) {
      return Response.json(
        { success: false, error: "请填写实习公司和工作内容" },
        { status: 400 }
      );
    }

    const apiKey = process.env.MINIMAX_API_KEY;

    if (!apiKey) {
      return Response.json(
        { success: false, error: "请配置 MINIMAX_API_KEY" },
        { status: 500 }
      );
    }

    const buildRewritePrompt = (sourceDescription: string) => `你是专业的中文简历优化师。请把用户口语化记录的工作内容，改写成可以直接放入简历的专业 bullet。

## 用户补充的实习信息
- 公司：${company}
- 岗位：${position || "未填写"}
- 时间：${startDate || "未填写"} - ${endDate || "至今"}

## 用户输入的口语化工作内容
${sourceDescription}

## 用户原有简历内容（仅用于参考表达风格）
${resumeContent || "未提供"}

## 改写规则
1. 允许把用户输入中的碎片词整理成专业工作流，例如“达人筛选、建联、脚本审核、视频审核、投放支持”可以整理为“达人投放全流程”。
2. 不得编造具体平台、品牌、项目、客户、职责或成果。用户没有写“小红书、抖音”，就不能擅自添加。
3. 每条 bullet 尽量包含适合该工作模块的量化结果。具体数值统一写成 XX 占位，不得输出真实数字。例如：“累计对接达人 XX+”“内容按期上线率达 XX%+”“优质达人复用率提升约 XX%+”。
4. XX 占位只在确实有助于量化时添加，每条最多 2 个。不得编造具体数字。
5. 当前输入是一组工作碎片。只输出 1 条 bullet，将属于同一工作流的碎片整理成一条完整表达，不要机械拆分。
6. 关键词必须是具体能力模块，例如“达人投放全流程”“内容审核”，不得输出“关键词”“市场运营实习生”等空泛标签。
7. 输出 1-4 条 bullet，每条格式为「- **具体能力模块**：专业表达」。
8. 只输出 bullet，不要解释，不要输出标题。

## 示例
用户输入：koc kol 达人筛选 建联 脚本审核 视频审核 投放支持全流程
合格输出：
- **KOL定向匹配**：负责达人筛选、建联、Brief 审核、内容审核及发布全流程，累计对接达人 XX+，内容按期上线率达 XX%+。

更多合格表达参考：
- **投放复盘迭代**：跟进投放数据反馈，整理曝光、互动及转化数据并撰写复盘报告，定期迭代投放方案，优质达人复用率提升约 XX%+。
- **Brief撰写优化**：根据品牌投放需求和产品卖点，提炼痛点、场景化表达及使用对比的 Brief 结构，内容互动及收藏表现提升约 XX%+。`;

    const sourceItems = getSourceItems(description);
    const optimizedDescription = (
      await Promise.all(
        sourceItems.map(async sourceItem =>
          normalizeRewrite(
            await callMiniMax(apiKey, buildRewritePrompt(sourceItem)),
            sourceItem
          )
        )
      )
    ).join("\n");
    const proofMaterials = (artifacts as Artifact[] | undefined)?.slice(0, 5) || [];
    let materialCandidates: string[] = [];

    if (proofMaterials.length > 0) {
      const materialPrompt = `你是简历经历梳理助手。请阅读用户上传的工作材料，提炼可能值得写进简历的候选 bullet，帮助用户回忆和总结工作内容。

## 用户已填写的工作内容（用于避免重复）
${description}

## 辅助材料
${proofMaterials.map(artifact => `### 文件：${artifact.fileName || "未命名材料"}
${artifact.content?.slice(0, 8000) || "文件内容为空"}`).join("\n\n")}

## 提炼规则
1. 输出的是供用户选择的候选 bullet。优先识别可迁移的工作流、职责模块和成果方向。
2. 使用专业、简洁、可直接编辑的简历表达。不要添加“可确认”“待确认”“可补充”“请确认”等提示文字。
3. 材料中出现数据时可以保留，但不要把团队行为夸大为个人成果。
4. 不要重复用户已填写的内容，重点补充用户可能遗漏的工作模块。
5. 返回 JSON 字符串数组，最多 6 条。不要输出 JSON 以外的内容。

示例格式：
["候选要点一", "候选要点二"]`;

      materialCandidates = parseCandidateBullets(await callMiniMax(apiKey, materialPrompt));
    }

    return Response.json({
      success: true,
      data: {
        optimizedDescription,
        materialCandidates,
      },
    });
  } catch (error) {
    console.error("实习经历润色失败:", error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "润色失败，请稍后重试" },
      { status: 500 }
    );
  }
}
