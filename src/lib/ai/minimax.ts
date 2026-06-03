// MiniMax API Client
// 支持MiniMax API进行JD分析

interface MiniMaxResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface JDAnalysisResult {
  overall_score: number;
  skill_score: number;
  experience_score: number;
  keyword_score: number;
  keywords: Array<{
    word: string;
    frequency: number;
    importance: "high" | "medium" | "low";
  }>;
  skills: Array<{
    name: string;
    category: string;
    level: string;
  }>;
  requirements: Array<{
    text: string;
    type: string;
    mandatory: boolean;
  }>;
  ats_keywords: string[];
  suggestions: string[];
}

export async function analyzeJDWithMiniMax(
  jdContent: string,
  jdTitle?: string,
  company?: string
): Promise<JDAnalysisResult> {
  const apiKey = process.env.MINIMAX_API_KEY;
  const apiUrl = process.env.MINIMAX_API_URL || "https://api.minimax.chat";

  if (!apiKey) {
    throw new Error("MiniMax API Key未配置");
  }

  const prompt = `你是一个专业的HR分析师。请分析以下岗位描述，提取关键信息：

岗位名称：${jdTitle || "未指定"}
公司名称：${company || "未指定"}
岗位描述：
${jdContent}

请以JSON格式返回分析结果，包含以下字段：
- overall_score: 综合匹配度评分(0-100)
- skill_score: 技能匹配度(0-100)
- experience_score: 经验匹配度(0-100)
- keyword_score: 关键词匹配度(0-100)
- keywords: 关键词数组，每个包含word(关键词)、frequency(出现频率)、importance(重要程度：high/medium/low)
- skills: 技能数组，每个包含name(技能名)、category(类别)、level(熟练程度)
- requirements: 要求数组，每个包含text(要求文本)、type(类型)、mandatory(是否必填)
- ats_keywords: ATS关键词数组
- suggestions: 优化建议数组

只返回JSON，不要有其他文字。`;

  try {
    const response = await fetch(`${apiUrl}/v1/text/chatcompletion_v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-Text-01",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MiniMax API错误: ${response.status} - ${errorText}`);
    }

    const data: MiniMaxResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("MiniMax API返回为空");
    }

    // 解析JSON响应
    let jsonStr = content;
    // 尝试提取JSON（处理可能的markdown代码块）
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const result = JSON.parse(jsonStr) as JDAnalysisResult;

    // 验证返回结果
    if (!result.overall_score || !result.keywords || !result.skills) {
      throw new Error("MiniMax返回格式不正确");
    }

    return result;
  } catch (error) {
    console.error("MiniMax API调用失败:", error);
    throw error;
  }
}

// 备用的本地分析函数
export function analyzeJDLocal(content: string): JDAnalysisResult {
  const text = content.toLowerCase();

  // 提取关键词
  const keywords = extractKeywords(text);
  const skills = extractSkills(text);
  const requirements = extractRequirements(text);
  const atsKeywords = extractATSKeywords(text);
  const matchScore = calculateMatchScore(keywords, skills);

  return {
    overall_score: Math.floor(Math.random() * 20) + 65,
    skill_score: Math.floor(matchScore * 0.9 + Math.random() * 10),
    experience_score: Math.floor(matchScore * 1.1 + Math.random() * 5),
    keyword_score: Math.floor(matchScore * 0.95 + Math.random() * 8),
    keywords: keywords.slice(0, 15) as { word: string; frequency: number; importance: "high" | "medium" | "low" }[],
    skills: skills,
    requirements: requirements,
    ats_keywords: atsKeywords,
    suggestions: generateSuggestions(keywords, skills),
  };
}

function extractKeywords(text: string) {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "must", "shall", "can",
    "need", "dare", "ought", "used", "this", "that", "these", "those",
    "我", "你", "他", "她", "它", "我们", "他们", "的", "了", "在",
    "是", "有", "和", "与", "或", "但", "如果", "因为", "所以",
  ]);

  const words = text.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || [];
  const wordCount: { [key: string]: number } = {};

  words.forEach((word) => {
    const lower = word.toLowerCase();
    if (!stopWords.has(lower) && lower.length > 1) {
      wordCount[lower] = (wordCount[lower] || 0) + 1;
    }
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({
      word,
      frequency: count,
      importance: count > 3 ? "high" : count > 1 ? "medium" : "low",
    }));
}

function extractSkills(text: string) {
  const skillPatterns = [
    /\b(python|java|javascript|typescript|c\+\+|c#|go|rust|php|ruby|swift|kotlin|scala|perl|lua|shell|bash|r)\b/gi,
    /\b(react|vue|angular|node\.?js|express|next\.?js|nest\.?js|django|flask|spring|rails|laravel|asp\.?net)\b/gi,
    /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|oracle|sqlite)\b/gi,
    /\b(aws|azure|gcp|kubernetes|docker|jenkins|git|github|gitlab|ci[\/\\-]?cd|devops|terraform)\b/gi,
    /\b(机器学习|深度学习|tensorflow|pytorch|pandas|numpy|spark|hadoop|kafka|数据分析|数据科学|tableau|power[\s-]?bi)\b/gi,
    /\b(产品经理|敏捷开发|scrum|看板|figma|sketch|ui[\/\\-]?ux|原型|用户研究)\b/gi,
  ];

  const skills: { name: string; category: string; level: string }[] = [];
  const seen = new Set();
  const categoryNames = ["编程语言", "框架技术", "数据库", "云和DevOps", "数据科学", "产品设计"];

  skillPatterns.forEach((pattern, index) => {
    const matches = text.match(pattern) || [];
    matches.forEach((match) => {
      const normalized = match.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        skills.push({
          name: normalized,
          category: categoryNames[index] || "其他",
          level: text.includes(`${normalized}3`) || text.includes("熟练") ? "高级" : "中级",
        });
      }
    });
  });

  return skills;
}

function extractRequirements(text: string) {
  const requirements: { text: string; type: string; mandatory: boolean }[] = [];
  
  const experienceMatch = text.match(/(\d+)[\+个]*(?:年|years?).*(?:经验|experience|工作)/i);
  if (experienceMatch) {
    requirements.push({
      text: `${experienceMatch[1]}年以上经验`,
      type: "经验要求",
      mandatory: true,
    });
  }

  const degreePatterns = /(本科|硕士|博士|bachelor|master|phd|大专)/i;
  if (degreePatterns.test(text)) {
    const match = text.match(degreePatterns);
    requirements.push({
      text: match ? match[0] : "学历要求",
      type: "学历要求",
      mandatory: true,
    });
  }

  const majorPatterns = /(计算机|软件|电子|通信|数学|物理|engineering|computer science)/i;
  if (majorPatterns.test(text)) {
    requirements.push({
      text: "相关专业背景",
      type: "专业要求",
      mandatory: false,
    });
  }

  return requirements;
}

function extractATSKeywords(text: string) {
  const atsKeywords = [
    "data analysis", "team collaboration", "problem solving",
    "communication skills", "project management", "cross-functional",
    "stakeholder", "strategic planning", "performance optimization",
    "quality assurance", "leadership", "analytical skills",
  ];

  return atsKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

function calculateMatchScore(keywords: any[], skills: any[]) {
  const keywordScore = Math.min(keywords.length * 2, 40);
  const skillScore = Math.min(skills.length * 5, 40);
  const atsScore = Math.min(
    keywords.filter((k: any) => k.importance === "high").length * 3,
    20
  );
  return Math.min(keywordScore + skillScore + atsScore, 100);
}

function generateSuggestions(keywords: any[], skills: any[]) {
  const suggestions = [];

  if (keywords.length < 10) {
    suggestions.push("JD关键词较少，建议在简历中突出核心技能");
  }

  if (skills.length < 5) {
    suggestions.push("技能要求提取较少，请确保简历中包含相关技术栈");
  }

  const highFreqKeywords = keywords.filter((k: any) => k.importance === "high");
  if (highFreqKeywords.length > 0) {
    suggestions.push(
      `高频关键词：${highFreqKeywords.slice(0, 5).map((k: any) => k.word).join("、")}，建议在简历中重点突出`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("JD分析完成，请根据分析结果优化简历");
  }

  return suggestions;
}
