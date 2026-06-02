# 🚀 OfferPilot 快速启动指南

## 方法一：使用启动脚本（推荐）

### 步骤1：双击运行
在文件资源管理器中，找到 `c:\claude\offerpilot\` 目录
**双击 `start.bat` 文件**

### 步骤2：等待安装
如果这是第一次运行，脚本会自动安装依赖（可能需要3-5分钟）

### 步骤3：访问网站
看到提示 "启动成功！请访问: http://localhost:3000" 后
打开浏览器访问 **http://localhost:3000**

---

## 方法二：手动启动

### 步骤1：打开终端
按 `Win + R`，输入 `cmd`，回车

### 步骤2：进入项目目录
```bash
cd c:\claude\offerpilot
```

### 步骤3：安装依赖
```bash
npm install
```
（首次运行需要，等待3-5分钟）

### 步骤4：启动服务器
```bash
npm run dev
```

### 步骤5：访问
打开浏览器访问 **http://localhost:3000**

---

## 常见问题

### Q1: 提示 "npm不是内部或外部命令"
**解决方法**：安装Node.js
- 下载地址：https://nodejs.org/
- 选择LTS版本（长期支持版）
- 安装时勾选 "Add to PATH"

### Q2: 安装依赖很慢
**解决方法**：使用淘宝镜像
```bash
npm install --registry=https://registry.npmmirror.com
```

### Q3: 端口3000被占用
**解决方法**：使用其他端口
```bash
npm run dev -- -p 3001
```
然后访问 http://localhost:3001

### Q4: 页面显示空白或报错
**解决方法**：检查浏览器控制台错误信息
- 按 F12 打开开发者工具
- 查看 Console 标签页
- 常见错误：
  - "Supabase连接失败" → 需要配置 .env.local
  - "Module not found" → 需要重新 npm install

---

## 首次使用前配置（可选）

如果你想使用完整功能（保存数据、登录注册），需要配置Supabase：

### 1. 创建Supabase项目
访问 https://supabase.com
- 注册/登录账号
- 点击 "New Project"
- 记录 Project URL 和 API Keys

### 2. 配置环境变量
编辑 `c:\claude\offerpilot\.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-key-here
OPENAI_API_KEY=your-openai-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 初始化数据库
在Supabase Dashboard中：
- 进入 SQL Editor
- 复制 `supabase/schema.sql` 的内容
- 执行SQL

---

## 快速测试（无需配置）

不配置Supabase也可以测试界面：
1. 运行 `npm run dev`
2. 访问 http://localhost:3000
3. 首页会正常显示
4. 登录/注册功能需要配置Supabase
5. JD分析功能可以正常使用（本地算法）

---

## 项目结构

```
offerpilot/
├── start.bat              # 一键启动脚本
├── src/
│   ├── app/
│   │   ├── page.tsx     # 首页
│   │   ├── auth/        # 登录/注册
│   │   └── dashboard/   # 工作台
│   └── components/      # 组件
├── package.json         # 依赖配置
└── README.md           # 项目说明
```

---

## 技术支持

遇到问题？
1. 查看常见问题
2. 查看浏览器控制台错误
3. 重启开发服务器（Ctrl+C 停止，然后 npm run dev）

祝使用愉快！🎉
