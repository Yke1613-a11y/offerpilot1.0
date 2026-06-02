"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  Sparkles,
  Lightbulb,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AnalysisResult {
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

interface JDAnalysisPanelProps {
  result: AnalysisResult;
  jdTitle: string;
  company: string;
}

export function JDAnalysisPanel({
  result,
  jdTitle,
  company,
}: JDAnalysisPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { text: "优秀", color: "bg-green-100 text-green-800" };
    if (score >= 60) return { text: "良好", color: "bg-yellow-100 text-yellow-800" };
    if (score >= 40) return { text: "一般", color: "bg-orange-100 text-orange-800" };
    return { text: "较差", color: "bg-red-100 text-red-800" };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getScoreLabelResult = getScoreLabel(result.overall_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {jdTitle || "岗位分析报告"}
            </h2>
            <p className="text-blue-100">
              {company ? `${company} · ` : ""}
              {new Date().toLocaleDateString("zh-CN")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold">{result.overall_score}</div>
            <Badge className={`mt-2 ${getScoreLabelResult.color}`}>
              {getScoreLabelResult.text}
            </Badge>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              综合评分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(result.overall_score)}`}>
              {result.overall_score}
            </div>
            <Progress
              value={result.overall_score}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              技能匹配
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(result.skill_score)}`}>
              {result.skill_score}
            </div>
            <Progress
              value={result.skill_score}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              经验匹配
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(result.experience_score)}`}>
              {result.experience_score}
            </div>
            <Progress
              value={result.experience_score}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              关键词匹配
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(result.keyword_score)}`}>
              {result.keyword_score}
            </div>
            <Progress
              value={result.keyword_score}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Keywords Cloud */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              关键词提取
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {result.keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`px-3 py-1 ${
                    keyword.importance === "high"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : keyword.importance === "medium"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {keyword.word}
                  <span className="ml-1 text-xs opacity-60">({keyword.frequency})</span>
                </Badge>
              ))}
            </div>

            {result.keywords.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                未能提取到足够的关键词
              </p>
            )}
          </CardContent>
        </Card>

        {/* ATS Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              ATS关键词
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.ats_keywords.length > 0 ? (
              <div className="space-y-2">
                {result.ats_keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{keyword}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                未能提取ATS关键词
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills and Requirements */}
      <div className="grid grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              技能要求
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.skills.length > 0 ? (
              <div className="space-y-3">
                {result.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{skill.name}</div>
                      <div className="text-xs text-gray-500">{skill.category}</div>
                    </div>
                    <Badge variant="outline">{skill.level}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                未能提取技能要求
              </p>
            )}
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              岗位要求
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.requirements.length > 0 ? (
              <div className="space-y-3">
                {result.requirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      req.mandatory ? "bg-red-50" : "bg-blue-50"
                    }`}
                  >
                    {req.mandatory ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{req.text}</div>
                      <Badge variant="outline" className="mt-1">
                        {req.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                未能提取岗位要求
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Lightbulb className="h-5 w-5" />
            优化建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-yellow-800">
                <span className="mt-1">💡</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Link href="/dashboard/optimize">
          <Button size="lg" className="px-8">
            <FileText className="h-5 w-5 mr-2" />
            优化简历
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="px-8">
          <TrendingUp className="h-5 w-5 mr-2" />
          查看趋势
        </Button>
      </div>
    </div>
  );
}
