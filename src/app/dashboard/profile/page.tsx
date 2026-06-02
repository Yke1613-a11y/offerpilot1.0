"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Target,
  Wand2,
  ClipboardList,
  Settings,
  LogOut,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Plus,
  X,
  Save,
} from "lucide-react";

interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string;
  school: string;
  major: string;
  degree: string;
  skills: string[];
}

interface Experience {
  id: string;
  type: "education" | "internship" | "project";
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile>({
    id: "",
    email: "",
    name: "",
    phone: "",
    school: "",
    major: "",
    degree: "",
    skills: [],
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "education" | "experience" | "skills">("basic");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      setProfile({
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || "",
        phone: user.user_metadata?.phone || "",
        school: user.user_metadata?.school || "",
        major: user.user_metadata?.major || "",
        degree: user.user_metadata?.degree || "",
        skills: user.user_metadata?.skills || [],
      });
      setLoading(false);
    };

    getUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          phone: profile.phone,
          school: profile.school,
          major: profile.major,
          degree: profile.degree,
          skills: profile.skills,
        },
      });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">OfferPilot</span>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <FileText className="h-5 w-5" />
              <span>工作台</span>
            </Link>
            <Link
              href="/dashboard/resumes"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <FileText className="h-5 w-5" />
              <span>简历管理</span>
            </Link>
            <Link
              href="/dashboard/jd"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Target className="h-5 w-5" />
              <span>JD分析</span>
            </Link>
            <Link
              href="/dashboard/optimize"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Wand2 className="h-5 w-5" />
              <span>简历优化</span>
            </Link>
            <Link
              href="/dashboard/interview"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <ClipboardList className="h-5 w-5" />
              <span>面试准备</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600"
            >
              <Settings className="h-5 w-5" />
              <span>设置</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
              {profile.name?.[0] || profile.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{profile.name || "用户"}</div>
              <div className="text-xs text-gray-500 truncate">{profile.email}</div>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">个人设置</h1>
            <p className="text-gray-600">管理你的个人信息和求职资料</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border mb-6">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("basic")}
                  className={`px-6 py-4 font-medium border-b-2 ${
                    activeTab === "basic"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  基本信息
                </button>
                <button
                  onClick={() => setActiveTab("education")}
                  className={`px-6 py-4 font-medium border-b-2 ${
                    activeTab === "education"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <GraduationCap className="h-4 w-4 inline mr-2" />
                  教育背景
                </button>
                <button
                  onClick={() => setActiveTab("experience")}
                  className={`px-6 py-4 font-medium border-b-2 ${
                    activeTab === "experience"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Briefcase className="h-4 w-4 inline mr-2" />
                  经历
                </button>
                <button
                  onClick={() => setActiveTab("skills")}
                  className={`px-6 py-4 font-medium border-b-2 ${
                    activeTab === "skills"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Code className="h-4 w-4 inline mr-2" />
                  技能
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        placeholder="输入你的姓名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号码</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        placeholder="输入手机号码"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">
                      邮箱地址不可修改
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "education" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="school">学校</Label>
                      <Input
                        id="school"
                        value={profile.school}
                        onChange={(e) =>
                          setProfile({ ...profile, school: e.target.value })
                        }
                        placeholder="输入学校名称"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">专业</Label>
                      <Input
                        id="major"
                        value={profile.major}
                        onChange={(e) =>
                          setProfile({ ...profile, major: e.target.value })
                        }
                        placeholder="输入专业名称"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="degree">学历</Label>
                    <select
                      id="degree"
                      value={profile.degree}
                      onChange={(e) =>
                        setProfile({ ...profile, degree: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">选择学历</option>
                      <option value="本科">本科</option>
                      <option value="硕士">硕士</option>
                      <option value="博士">博士</option>
                      <option value="MBA">MBA</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">实习经历</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加经历
                    </Button>
                  </div>
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无实习经历</p>
                    <p className="text-sm mt-2">
                      添加你的实习经历，提升简历竞争力
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>添加技能</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="输入技能名称，如：Python、React"
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={addSkill}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-4 block">我的技能</Label>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          还没有添加任何技能
                        </p>
                      ) : (
                        profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="hover:text-blue-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">推荐技能</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Python",
                        "JavaScript",
                        "SQL",
                        "数据分析",
                        "机器学习",
                        "产品经理",
                        "项目管理",
                        "沟通能力",
                      ]
                        .filter((s) => !profile.skills.includes(s))
                        .map((skill) => (
                          <button
                            key={skill}
                            onClick={() =>
                              setProfile({
                                ...profile,
                                skills: [...profile.skills, skill],
                              })
                            }
                            className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                          >
                            <Plus className="h-3 w-3 inline mr-1" />
                            {skill}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div>
              {saved && (
                <p className="text-green-600 text-sm">
                  保存成功！
                </p>
              )}
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "保存中..." : "保存更改"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
