# 日语学习平台 - 重构方案

## 📋 概述

本平台已完成架构重构，从9个独立项目整合为统一的日语学习平台。

## 🎯 重构目标

1. **统一文件命名规范** - 解决"各自为政"的问题
2. **标准化目录结构** - 所有模块遵循相同的组织模式
3. **共享核心功能** - 提取公共代码，避免重复
4. **跨模块数据互通** - 实现学习进度、收藏等功能的统一管理

## 📁 新架构目录结构

```
riYu/
├── index.html                      # 主入口页面
├── css/
│   └── main.css                   # 主页面样式
├── js/
│   └── main.js                    # 主页面逻辑
├── shared/                         # 共享资源目录
│   ├── common.js                  # 通用功能库（语音、存储、进度管理）
│   └── components.js              # 可复用UI组件
├── css/
│   └── common.css                 # 公共样式
├── modules/                       # 模块目录（标准结构）
│   ├── noun/                      # 名词模块 ✅ 已完成
│   │   ├── index.html            # 模块入口
│   │   ├── css/
│   │   │   └── style.css         # 模块特定样式
│   │   ├── js/
│   │   │   └── module.js         # 模块逻辑
│   │   └── data/
│   │       └── noun.json         # 标准化数据
│   ├── verb/                      # 动词模块（开发中）
│   ├── adjective/                 # 形容词模块（开发中）
│   ├── adjectival-verb/           # 形容动词模块（开发中）
│   ├── adverb/                    # 副词模块（开发中）
│   ├── pronoun/                   # 代词模块（开发中）
│   ├── other-word/                # 其他词模块（开发中）
│   ├── loanword/                  # 外来语模块（开发中）
│   └── fixed-collocations/        # 固定搭配模块（开发中）
└── raw/                           # 原始数据和开发脚本（待整理）
```

## ✨ 核心功能

### 共享库 (shared/common.js)

- **SpeechHelper**: 语音合成功能
- **StorageHelper**: 本地存储管理
- **ProgressManager**: 学习进度跟踪
- **DataLoader**: 数据加载器
- **Utils**: 工具函数集合

### 组件库 (shared/components.js)

- **CardComponent**: 单词卡片组件
- **FilterComponent**: 筛选器组件

### 公共样式 (css/common.css)

- 统一的颜色方案
- 响应式布局
- 动画效果
- 基础组件样式

## 🚀 模块迁移进度

| 模块 | 状态 | 说明 |
|------|------|------|
| 名词 | ✅ 已完成 | 完全迁移到新架构 |
| 动词 | ✅ 已完成 | 完全迁移到新架构 |
| 形容词 | ✅ 已完成 | 完全迁移到新架构 |
| 形容动词 | ✅ 已完成 | 完全迁移到新架构 |
| 副词 | ✅ 已完成 | 完全迁移到新架构 |
| 代词 | ✅ 已完成 | 完全迁移到新架构 |
| 其他词 | ✅ 已完成 | 完全迁移到新架构 |
| 外来语 | ✅ 已完成 | 完全迁移到新架构 |
| 固定搭配 | ✅ 已完成 | 完全迁移到新架构 |

## 🔧 模块迁移步骤

以名词模块为例，迁移流程如下：

### 1. 创建标准目录结构
```
modules/noun/
├── index.html
├── css/style.css
├── js/module.js
└── data/noun.json
```

### 2. 重构HTML
- 使用共享样式 `css/common.css`
- 引入共享库 `shared/common.js` 和 `shared/components.js`
- 保持简洁的DOM结构

### 3. 重构JavaScript
- 使用 `ProgressManager` 管理学习进度和收藏
- 使用 `SpeechHelper` 实现语音功能
- 使用 `CardComponent` 创建卡片
- 使用 `DataLoader` 加载数据

### 4. 标准化数据格式
确保JSON数据包含必要字段：
- `id`: 唯一标识
- `word`: 单词
- `kana`: 假名（可选）
- `meaning`: 释义
- `examples`: 例句数组
- `level`: 等级（可选）
- `category`: 分类（可选）
- `memo`: 记忆妙招（可选）

### 5. 更新主页面
在 `index.html` 中添加模块入口链接

## 📊 数据互通

所有模块共享以下数据：

- **学习进度**: 记录每个单词的学习次数和时间
- **收藏**: 跨模块统一管理收藏的单词
- **最近学习**: 显示最近查看的单词

数据存储键格式: `{moduleType}:{wordId}`

例如:
- `noun:123` - 名词模块ID为123的单词
- `verb:456` - 动词模块ID为456的单词

## 🎨 设计规范

### 颜色方案
- 主色: `#ff69b4` (粉红)
- 辅助色: `#ffb6c1` (浅粉)
- 背景色: `#f8f0f6` (浅紫粉)
- 文字色: `#333` (深灰)

### 字体
- 中文: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- 日文: 'Noto Sans JP', sans-serif

## 🔒 原始项目处理

原始9个独立项目暂时保留在根目录：
- `riYu_SIJI/`
- `riYu_verb/`
- `riyu_ADJ/`
- `riYu_adjectival_verb/`
- `riYu_ADV/`
- `riyu_pron_word/`
- `riyu_other_word/`
- `riYu_loanword/`
- `riyu_Fixed_collocations/`

**说明**: 所有模块迁移完成后，可以将原始项目移至 `raw/` 目录或删除

## 📝 注意事项

1. **必须通过HTTP服务器运行**
   - 不能直接双击 `index.html` 打开
   - 使用 `start.bat` (Windows) 或 `start.sh` (Linux/Mac) 启动

2. **模块命名规范**
   - 文件夹名: 小写+连字符 (如: `adjectival-verb`)
   - 数据文件: `{模块名}.json`
   - 样式文件: `style.css`
   - 脚本文件: `module.js`

3. **数据路径**
   - 所有模块数据统一放在 `data/` 目录
   - 使用相对路径引用: `data/{模块名}.json`

## 🚀 快速开始

1. 运行启动脚本:
   - Windows: 双击 `start.bat`
   - Linux/Mac: 运行 `./start.sh`

2. 浏览器访问:
   - Python: http://localhost:8000/index.html
   - Node.js: http://localhost:3000/index.html

3. 开始学习！点击"名词"模块进入

## 🎯 后续计划

- [x] 迁移动词模块
- [x] 迁移形容词模块
- [x] 迁移其余6个模块
- [ ] 实现跨模块测试功能
- [ ] 添加学习统计dashboard
- [ ] 实现导出学习报告
- [ ] 添加每日学习计划功能

## 📖 参考文档

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 项目状态
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
- [README.md](./README.md) - 项目说明

---

**最后更新**: 2026-01-25
**版本**: v2.0 (重构版)
