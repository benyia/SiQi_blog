# SiQi's Blog



🌐 在线访问：[https://siqi926.dpdns.org](https://siqi926.dpdns.org)

---

## ✨ 功能特性

- 📝 **Markdown 写博客** - 支持代码高亮、KaTeX 数学公式
- 🎨 **可视化配置** - 网站标题、配色、布局都可以在网页上直接改
- 📱 **响应式设计** - 手机端完美适配
- 🎭 **主题定制** - 自定义配色、背景图片、头像
- 📊 **课程管理** - 课程列表、学习目录、学习日志、进度跟踪
- ☁️ **零成本部署** - Vercel 免费托管，无需服务器

---

## 🛠 技术栈

- **框架**：Next.js 16 + React 19
- **样式**：Tailwind CSS 4
- **部署**：Vercel
- **数据存储**：GitHub 仓库（通过 GitHub App 读写）
- **域名**：Cloudflare DNS 管理

---

## 🚀 部署方式

本项目 Fork 自 [YYsuni/2025-blog-public](https://github.com/YYsuni/2025-blog-public)，部署流程：

1. Fork 原项目到自己的 GitHub 账号
2. 导入 Vercel 一键部署
3. 创建 GitHub App 并授权仓库
4. 配置环境变量（OWNER / REPO / APP_ID 等）
5. 绑定自定义域名

---

## 📁 项目结构

```
src/
├── app/
│   ├── (home)/          # 首页组件
│   │   ├── page.tsx     # 首页主页面
│   │   ├── hi-card.tsx  # 问候卡片
│   │   ├── courses-card.tsx  # 课程入口卡片
│   │   └── ...
│   └── courses/         # 课程模块
│       ├── page.tsx    # 课程列表页
│       └── [id]/       # 课程详情页
├── config/
│   ├── site-content.json  # 网站配置
│   └── courses.json     # 课程数据
└── components/        # 通用组件
```

---

## 📝 自定义配置

### 网站设置
首页点击设置按钮，可修改：
- 站点标题、描述、用户名
- 配色方案
- 社交链接
- 首页布局

### 课程数据
编辑 `src/config/courses.json`，可管理：
- 课程列表与进度
- 学习目录（课堂、作业、考试）
- 学习日志
- 课程成员

---

## 📄 License

MIT License

---

> 由 [SiQi](https://github.com/benyia) 使用 ❤️ 构建
