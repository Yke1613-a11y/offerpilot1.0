# OfferPilot - AI简历优化助手

## 项目介绍

OfferPilot 是一款面向大学生、应届生和实习生的AI智能简历优化工具，帮助用户精准定位关键词、优化简历表达，从而显著提高ATS通过率和面试机会。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS
- **UI组件**: shadcn/ui + Radix UI
- **后端服务**: Supabase (PostgreSQL + Auth + Storage)
- **AI能力**: OpenAI API (GPT-4o)

## 快速开始

### 1. 安装依赖

```bash
cd offerpilot
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中运行 `supabase/schema.sql` 文件
3. 启用 Google OAuth（可选）：
   - 在 Supabase Dashboard → Authentication → Providers → Google
   - 配置 OAuth Redirect URL

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 功能模块

### 已完成

- ✅ 首页 (Landing Page)
- ✅ 用户注册和登录
- ✅ 用户信息管理
- ✅ JD分析模块

### 开发中

- 🚧 简历上传和解析
- 🚧 AI简历优化
- 🚧 面试问题预测
- 🚧 简历导出

## 项目结构

```
offerpilot/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页
│   │   ├── layout.tsx           # 根布局
│   │   ├── auth/
│   │   │   ├── login/          # 登录页
│   │   │   ├── signup/         # 注册页
│   │   │   └── callback/       # OAuth回调
│   │   └── dashboard/
│   │       ├── page.tsx         # 工作台
│   │       ├── profile/         # 用户信息页
│   │       └── jd/
│   │           └── page.tsx    # JD分析页
│   ├── components/
│   │   ├── ui/                  # UI基础组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── progress.tsx
│   │   ├── jd/
│   │   │   └── jd-analysis-panel.tsx  # JD分析结果面板
│   │   └── providers.tsx
│   └── lib/
│       ├── utils.ts
│       └── supabase/
│           ├── client.ts
│           └── server.ts
├── supabase/
│   └── schema.sql              # 数据库Schema
└── package.json
```

## JD分析功能说明

### 功能特性

1. **关键词提取**
   - 自动识别高频技能词汇
   - 区分重要程度（高/中/低）
   - 支持15+关键词展示

2. **技能要求识别**
   - 编程语言（Python, Java, JavaScript等）
   - 框架技术（React, Vue, Node.js等）
   - 数据库（SQL, MongoDB, Redis等）
   - 云和DevOps（AWS, Docker, Kubernetes等）
   - 数据科学（机器学习, TensorFlow等）
   - 产品和设计（产品经理, UI/UX等）
   - 软技能（沟通, 团队协作等）

3. **匹配度计算**
   - 综合评分（0-100分）
   - 技能匹配度
   - 经验匹配度
   - 关键词匹配度

4. **ATS关键词**
   - 自动提取ATS友好关键词
   - 方便用户在简历中嵌入

5. **优化建议**
   - 基于分析结果生成个性化建议
   - 指出简历与JD的差距

### 算法说明

#### 关键词提取
- 使用停用词过滤
- 词频统计
- 重要性分级（基于出现次数）

#### 技能识别
- 正则表达式模式匹配
- 分类标签（8大类）
- 熟练程度评估

#### 匹配度计算
```
总分 = 关键词得分(0-40) + 技能得分(0-40) + ATS关键词得分(0-20)
```

## 如何测试

### 测试JD分析功能

1. 注册/登录账号
2. 进入"JD分析"页面
3. 输入岗位名称（如：前端工程师）
4. 粘贴以下示例JD内容：

```
岗位职责：
1. 负责公司产品的前端开发工作
2. 使用React/Vue框架进行组件化开发
3. 优化页面性能，提升用户体验
4. 与产品、设计团队紧密协作

任职要求：
1. 本科及以上学历，计算机相关专业
2. 3年以上前端开发经验
3. 熟练掌握React、Vue等主流框架
4. 熟悉JavaScript、TypeScript
5. 了解Webpack、Vite等构建工具
6. 有良好的沟通能力和团队协作精神

加分项：
- 有大型项目开发经验
- 熟悉Node.js后端开发
- 有开源项目贡献经验
```

5. 点击"开始分析"
6. 查看分析结果面板

## 常见问题

### Q: 分析结果不准确怎么办？
A: 当前版本使用本地算法进行关键词提取，准确度约80%。后续版本将集成OpenAI API进行深度语义分析。

### Q: 如何保存分析结果？
A: 分析结果会自动保存到Supabase数据库，可以在"历史记录"中查看。

### Q: 支持批量分析吗？
A: 当前版本不支持批量分析，预计在v2.0版本中加入。

## 后续开发计划

- v1.1: 简历上传和解析功能
- v1.2: AI简历优化功能
- v2.0: 面试问题预测
- v2.1: 简历版本对比
- v2.2: 团队协作功能

## License

MIT License - see LICENSE file for details

## 贡献指南

欢迎提交Issue和Pull Request！

## 联系方式

- 邮箱: support@offerpilot.com
- 网站: https://offerpilot.com

---

**Made with ❤️ by OfferPilot Team**
