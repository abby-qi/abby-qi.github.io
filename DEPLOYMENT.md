# GitHub Pages 部署指南

## 问题描述

之前部署到 GitHub Pages 时 CSS 工作不正常，主要原因是在 `css/common.css` 中使用了 `@import` 语句：
```css
@import './main.css';
```

这种写法在 GitHub Pages 上会导致以下问题：
1. **异步加载**：CSS 文件异步加载，导致样式闪烁或延迟加载
2. **路径解析问题**：相对路径在部署时可能解析错误
3. **性能问题**：阻止页面渲染，影响用户体验

## 已实施的修复

### 1. 移除 @import 语句
从 `css/common.css` 中移除了 `@import './main.css';`，改为在 HTML 中直接引入：
```html
<link rel="stylesheet" href="css/common.css">
<link rel="stylesheet" href="css/main.css">
```

### 2. 添加配置文件
- **`_config.yml`**: GitHub Pages 的 Jekyll 配置文件，优化网站设置
- **`_redirects`**: 确保 SPA（单页应用）路由正确工作
- **`.gitignore`**: 排除不必要的文件

## 部署步骤

### 方法一：通过 GitHub 网页界面部署（推荐）

1. **提交更改**
   ```bash
   git add .
   git commit -m "修复 GitHub Pages CSS 加载问题"
   git push origin main
   ```

2. **确认 GitHub Pages 设置**
   - 进入仓库的 **Settings** → **Pages**
   - 在 **Source** 中选择：
     - **Branch**: `main`
     - **Folder**: `/ (root)`
   - 点击 **Save**

3. **等待部署**
   - GitHub 会自动构建和部署
   - 通常需要 1-3 分钟
   - 可以在仓库的 **Actions** 标签页查看部署状态

### 方法二：通过 GitHub Actions 自动部署

1. 创建 `.github/workflows/deploy.yml`：
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: .
   ```

2. 提交并推送代码，GitHub Actions 会自动部署

## 验证部署

1. 访问你的网站：`https://abby-qi.github.io`
2. 打开浏览器开发者工具（F12）
3. 在 **Network** 标签页检查：
   - CSS 文件是否成功加载（状态码 200）
   - 加载时间是否正常
4. 在 **Console** 标签页检查是否有 CSS 相关错误

## 常见问题

### Q1: CSS 样式仍然不生效
- 检查浏览器缓存，尝试硬刷新（Ctrl+Shift+R）
- 确认 CSS 文件路径是否正确
- 检查 Network 标签页，查看 CSS 文件是否成功加载

### Q2: 部署后页面空白
- 检查 GitHub Actions 的构建日志
- 确认 JavaScript 文件路径是否正确
- 查看 Console 是否有 JavaScript 错误

### Q3: 子页面 CSS 不生效
- 确保所有 HTML 文件都正确引入了 CSS 文件
- 检查相对路径是否正确（例如：`../css/common.css`）

## 优化建议

1. **压缩 CSS 和 JS 文件**
   - 减小文件大小，提高加载速度
   - 使用工具如：`cssnano`, `terser`

2. **启用缓存**
   - 在 HTML 中添加缓存控制
   - 使用 CDN 加载第三方库（如 Font Awesome）

3. **使用现代 CSS 特性**
   - CSS Variables
   - CSS Grid 和 Flexbox
   - 减少 JavaScript 依赖

## 项目结构

```
abby-qi.github.io/
├── css/                    # CSS 样式文件
│   ├── common.css         # 公共样式
│   ├── main.css           # 主样式
│   └── ...
├── js/                     # JavaScript 文件
├── pages/                  # 功能页面
├── modules/                # 学习模块
├── shared/                 # 共享资源
├── index.html             # 首页
├── _config.yml            # Jekyll 配置
├── _redirects             # 路由重定向
└── .gitignore             # Git 忽略文件
```

## 维护

定期检查和更新：
- 浏览器兼容性
- 性能优化
- 依赖项更新
- 安全性检查

## 联系

如有问题，请提交 Issue 或 Pull Request。
