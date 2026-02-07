# 日语单词学习 - 统一平台

将9个独立的日语词汇学习子项目整合为单一的统一平台，提供模块化架构，支持各词性模块的差异化需求，并提供统一的学习管理和进度追踪。

## 项目结构

```
riYu/
├── index.html                    # 主入口页面
├── main.css                      # 基础样式 + CSS变量定义
├── main.js                       # 核心控制器
├── core/                         # 核心系统
│   ├── module-loader.js         # 动态加载模块资源
│   ├── style-manager.js         # 按需管理CSS
│   ├── data-manager.js          # 统一数据接口
│   ├── progress-tracker.js      # 学习进度追踪
│   └── collection-manager.js    # 统一收藏管理
├── modules/                      # 各学习模块
│   ├── verbs/                   # 动词模块（最复杂）
│   │   ├── verb-module.js       # 动词专用逻辑
│   │   ├── verb-styles.css      # 动词专用样式
│   │   └── data/                # 动词数据
│   │       └── verb-data.json   # 原始复杂JSON结构
│   ├── nouns/                   # 名词模块
│   │   ├── noun-module.js
│   │   ├── noun-styles.css
│   │   └── data/
│   │       └── words.json
│   ├── adjectives/              # 形容词
│   │   ├── adjective-module.js
│   │   ├── adjective-styles.css
│   │   └── data/
│   │       └── adjective.json
│   ├── adjectival-verbs/        # 形容动词
│   │   ├── adjectival-verb-module.js
│   │   ├── adjectival-verb-styles.css
│   │   └── data/
│   │       └── adjectival-verb-processed.json
│   ├── adverbs/                 # 副词
│   │   ├── adverb-module.js
│   │   ├── adverb-styles.css
│   │   └── data/
│   │       └── adv.json
│   ├── collocations/            # 固定搭配
│   │   ├── fixed-collocations-module.js
│   │   ├── fixed-collocations-styles.css
│   │   └── data/
│   │       └── fixed-collocations.json
│   ├── loanwords/               # 外来语
│   │   ├── loanword-module.js
│   │   ├── loanword-styles.css
│   │   └── data/
│   │       └── loanword-processed.json
│   ├── others/                  # 其他词
│   │   ├── other-module.js
│   │   ├── other-styles.css
│   │   └── data/
│   │       └── other-word.json
│   └── pronouns/                # 代词
│       ├── pronoun-module.js
│       ├── pronoun-styles.css
│       └── data/
│           └── pronoun.json
└── [原始子项目目录保留]         # 原始项目保留作为参考
```

## 模块说明

| 模块 | 对应文件夹 | 内容 | 复杂度 |
|------|-----------|------|--------|
| nouns | riYu_SIJI | 名词 | 中等 |
| verbs | riYu_verb | 动词（自他动词、动一动二动三） | 高 |
| adjectives | riyu_ADJ | 形容词（イ形容词） | 中等 |
| adjectival-verbs | riYu_adjectival_verb | 形容动词（ナ形容词） | 中等 |
| adverbs | riYu_ADV | 副词 | 中等 |
| pronouns | riyu_pron_word | 代词 | 简单 |
| others | riyu_other_word | 其他词 | 简单 |
| loanwords | riYu_loanword | 外来语 | 简单 |
| collocations | riyu_Fixed_collocations | 固定搭配 | 中等 |

## 功能特性

### 核心功能
- **统一入口**：通过index.html访问所有模块
- **模块化加载**：按需加载各模块的CSS和JS资源
- **学习进度追踪**：记录已学习、重点标记的词汇
- **收藏管理**：统一管理所有模块的收藏内容
- **学习仪表盘**：查看整体学习进度和统计

### 单词学习功能
- **单词卡片**：展示日语单词、假名、释义、例句
- **语音发音**：支持点击单词和例句进行日语发音
- **筛选功能**：按等级、重要程度、汉字数量等筛选
- **学习标记**：标记已学习、重点、收藏状态
- **随机抽查**：随机抽取单词进行复习
- **数据导出**：导出当前筛选列表为CSV文件

### 动词模块特殊功能
- **章节分组**：按章节组织动词学习
- **动词分类**：~う、~く、~す、~つ、~ぬ、~ぶ、~む、~る等
- **词性对比**：自动词vs他动词对比学习
- **模式切换**：普通模式、批量学习模式、词性对比模式、动词分类专注模式

## 使用方法

### 1. 本地运行

由于使用了ES6模块和fetch API，需要使用HTTP服务器运行，不能直接双击HTML文件打开。

**方法一：使用启动脚本（推荐）**

**Windows:**
```cmd
双击 start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**方法二：使用 npx serve**
```bash
cd d:/纳米AI下载/riYu
npx serve
```

**方法三：使用Python HTTP服务器**
```bash
cd d:/纳米AI下载/riYu
python -m http.server 8000
```

**方法四：使用VS Code的Live Server插件**
- 在VS Code中右键index-iframe.html
- 选择"Open with Live Server"

### 2. 访问平台

打开浏览器访问：
- `http://localhost:3000` (npx serve默认端口)
- `http://localhost:8000` (Python HTTP服务器默认端口)

### 3. 平台版本说明

本项目提供两个版本的入口页面：

#### 版本一：index-iframe.html（推荐，完全兼容）

**优点**：
- 完全复用原始子项目，100%兼容
- 各模块独立运行，互不干扰
- 所有功能都能正常使用
- 简单直接，无需修改原项目

**使用方式**：访问 `http://localhost:端口号/index-iframe.html`

#### 版本二：index.html（整合版本，需要进一步适配）

**特点**：
- 真正的统一平台架构
- 模块化加载，按需加载资源
- 统一的学习进度管理
- 目前部分模块需要适配

**使用方式**：访问 `http://localhost:端口号/index.html`

**建议**：初次使用建议使用 `index-iframe.html`，它已经可以完美运行所有模块。

### 4. 使用模块（iframe版本）

1. 在首页查看所有可用的学习模块
2. 点击任意模块卡片进入学习界面
3. 使用各模块自带的筛选和标记功能
4. 点击"返回首页"返回主页面

### 5. 功能测试

访问 `http://localhost:端口号/test.html` 可以测试基础功能是否正常。

## 数据格式

各模块的JSON数据格式略有不同，但都包含以下基本信息：

### 通用字段
```json
{
  "word": "日文单词",
  "kana": "假名",
  "meaning": "释义",
  "examples": [
    {
      "jp": "日文例句",
      "cn": "中文翻译"
    }
  ],
  "level": "N5/N4",
  "category": "分类"
}
```

### 动词特殊字段
```json
{
  "章节信息": "章节名称",
  "动词分类": "~う/~く/~す等",
  "重要程度": "☆/□",
  "词性": "自/他",
  "日文汉字": "汉字",
  "日文假名": "假名",
  "meanings": [
    {
      "text": "释义",
      "examples": [...]
    }
  ]
}
```

## 技术栈

- **HTML5**：语义化标签
- **CSS3**：Flexbox、Grid布局、动画效果
- **ES6+ JavaScript**：类、模块、异步函数
- **Web Speech API**：语音合成（日语发音）
- **LocalStorage**：学习进度持久化存储
- **Font Awesome**：图标库

## 浏览器兼容性

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

**注意**：语音合成功能依赖浏览器支持，部分浏览器可能需要用户先进行交互才能播放音频。

## 开发说明

### 添加新模块

1. 在`modules/`目录下创建新的模块文件夹
2. 创建模块的CSS、JS文件和数据文件
3. 在`core/module-loader.js`中添加模块路径配置
4. 在`index.html`的模块网格中添加模块卡片

### 修改样式

- 全局样式：修改`main.css`
- 模块样式：修改对应模块的`*-styles.css`

### 修改数据

直接修改`modules/*/data/*.json`文件，修改后刷新页面即可看到效果。

## 已知问题

1. **跨域问题**：必须使用HTTP服务器运行，不能直接打开HTML文件
2. **语音合成**：部分浏览器可能不支持日语语音，或需要用户先点击页面
3. **移动端适配**：部分功能在移动端可能需要优化

## 版本历史

### v1.0.0 (2026-01-25)
- 整合9个独立的日语词汇学习子项目
- 实现统一的学习管理平台
- 支持模块化动态加载
- 提供学习进度追踪和统计

## 许可证

本项目仅供学习使用。

## 贡献

欢迎提出问题和建议！

---

**祝你学习愉快！📚✨**
