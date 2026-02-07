# 多义词卡片与数据加载修复方案

## 📋 问题描述

### 1. 形容词卡片拆分错误
**问题**: 同一个形容词如有多个释义,被错误地拆分成多张独立卡片
- 示例: "青い" 被拆分为3张卡片(蓝、幼稚、苍白)
- 期望: 应为1张卡片,包含3个释义及各自例句

### 2. 模块数据加载失败
**问题**: 形容动词、外来语、固定搭配模块无法加载数据
- 错误: `node read property of undefined` / `reading split not found`
- 原因: 数据字段名不匹配解析逻辑

---

## ✅ 修复方案

### 修复1: 形容词多义词合并

**文件**: `modules/adjective/js/module.js`

**修改前**:
```javascript
async loadData() {
    this.allWords = rawData.map((item, index) => ({
        id: index + 1,
        word: item['日文汉字'] || item['日文'],
        kana: item['日文'].split('【')[0],
        meaning: item['释义'] || '',
        examples: item['例句'] ? [{...}] : [],
        // ...
    }));
}
```

**修改后**:
```javascript
async loadData() {
    // 按词条(日文汉字)分组,合并多义词
    const wordGroups = {};
    rawData.forEach((item, index) => {
        const word = item['日文汉字'] || item['日文'];
        const kana = item['日文'].split('【')[0];
        
        if (!wordGroups[word]) {
            wordGroups[word] = {
                id: Object.keys(wordGroups).length + 1,
                word: word,
                kana: kana,
                meanings: [],
                importance: item['重要程度'] || '□',
                category: item['重要程度'] || ''
            };
        }
        
        // 添加释义和对应的例句
        wordGroups[word].meanings.push({
            text: item['释义'] || '',
            examples: item['例句'] ? [{
                jp: item['例句'],
                cn: item['例句翻译']
            }] : []
        });
    });
    
    // 转换为数组格式
    this.allWords = Object.values(wordGroups);
}
```

---

### 修复2: 卡片组件支持多义词

**文件**: `shared/components.js`

**核心改进**:
1. 检测 `data.meanings` 数组(多义词模式)
2. 为每个释义生成编号和独立例句组
3. 保持向后兼容单一释义模式

```javascript
// 生成释义HTML - 支持多义词
let meaningHtml = '';
if (data.meanings && data.meanings.length > 0) {
    // 多义词模式
    meaningHtml = data.meanings.map((m, idx) => `
        <div class="meaning-item">
            <div class="meaning-number">${idx + 1}.</div>
            <div class="meaning-text">${m.text}</div>
        </div>
    `).join('');
} else if (data.meaning) {
    // 单一释义模式
    meaningHtml = `<div class="meaning-text">${data.meaning}</div>`;
}

// 生成例句HTML - 支持分组到各释义
let examplesHtml = '';
if (data.meanings && data.meanings.length > 0) {
    // 多义词模式 - 例句按释义分组
    examplesHtml = data.meanings.map((m, idx) => {
        if (m.examples && m.examples.length > 0) {
            return `
                <div class="example-group">
                    <div class="example-group-label">例句 ${idx + 1}</div>
                    ${m.examples.map(example => `
                        <div class="example-item">
                            <div class="example-jp" data-text="${example.jp}">
                                <i class="fas fa-volume-up example-audio-icon"></i>
                                ${example.jp}
                            </div>
                            <div class="example-cn">${example.cn}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        return '';
    }).join('');
} else if (data.examples && data.examples.length > 0) {
    // 单一释义模式
    // ...
}
```

---

### 修复3: 形容动词数据加载

**文件**: `modules/adjectival-verb/js/module.js`

**数据字段映射**:
- 原始字段: `日文汉字`, `日文假名`, `例句列表` → `例句`, `例句翻译`

```javascript
this.allWords = rawData.map((item, index) => ({
    id: index + 1,
    word: item['日文汉字'] || item['外来语'],
    kana: item['日文假名'] || item['外来语'],
    meaning: item['释义'] || '',
    examples: item['例句列表'] ? item['例句列表'].map(ex => ({
        jp: ex['例句'] || ex.jp,
        cn: ex['例句翻译'] || ex.cn
    })) : [],
    importance: item['重要程度'] || '□',
    category: item['重要程度'] || ''
}));
```

---

### 修复4: 外来语数据加载

**文件**: `modules/loanword/js/module.js`

**数据字段映射**:
- 原始字段: `外来语`, `例句`, `例句翻译`

```javascript
this.allWords = rawData.map((item, index) => ({
    id: index + 1,
    word: item['外来语'] || item['日文汉字'] || item['日文'],
    kana: item['外来语'] || item['日文'],
    meaning: item['释义'] || '',
    examples: item['例句'] ? [{
        jp: item['例句'],
        cn: item['例句翻译']
    }] : [],
    importance: item['重要程度'] || '□',
    category: item['来源'] || '英语'
}));
```

---

### 修复5: 固定搭配数据加载

**文件**: `modules/fixed-collocations/js/module.js`

**数据字段映射**:
- 原始字段: `固定搭配`, `例句列表` → `例句`, `例句翻译`

```javascript
this.allWords = rawData.map((item, index) => ({
    id: index + 1,
    word: item['固定搭配'] || item['日文汉字'] || item['日文'],
    kana: item['固定搭配'] || item['日文'],
    meaning: item['释义'] || '',
    examples: item['例句列表'] ? item['例句列表'].map(ex => ({
        jp: ex['例句'] || ex.jp,
        cn: ex['例句翻译'] || ex.cn
    })) : [],
    category: item['搭配类型'] || '其他'
}));
```

---

### 修复6: CSS样式支持多义词

**文件**: `css/common.css`

**新增样式**:

```css
/* 多义词样式 */
.meaning-item {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
    padding: 10px;
    background-color: #f8f0f6;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.meaning-item:hover {
    background-color: #ffe4e1;
    transform: translateX(5px);
}

.meaning-number {
    min-width: 25px;
    height: 25px;
    background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
}

/* 例句分组 */
.example-group {
    margin-bottom: 15px;
    padding-left: 10px;
    border-left: 3px solid #ff69b4;
}

.example-group-label {
    font-size: 0.85rem;
    color: #ff69b4;
    font-weight: 600;
    margin-bottom: 8px;
}
```

---

## 🎯 修复效果

### 形容词多义词显示

**修复前**:
```
卡片1: 青い (蓝色)
  例句: 空が青い。

卡片2: 青い (幼稚)
  例句: 考え方が青い。

卡片3: 青い (苍白)
  例句: 顔色が青い。
```

**修复后**:
```
卡片: 青い (あおい)
  释义:
    1. 蓝色
    2. 幼稚
    3. 苍白
  
  例句 1:
    - 空が青い。 (天很蓝)
  
  例句 2:
    - 考え方が青い。 (想法很幼稚)
  
  例句 3:
    - 顔色が青い。 (脸色苍白)
```

---

## 📦 结构化卡片模板 (RemNote 兼容)

### 多义词卡片模板

```
词条: [日文] ([假名])
读音: [假名] / [罗马音]

释义:
1. [释义1]
   - 例句: [日语例句]
   - 翻译: [中文翻译]

2. [释义2]
   - 例句: [日语例句]
   - 翻译: [中文翻译]

3. [释义3]
   - 例句: [日语例句]
   - 翻译: [中文翻译]

属性:
- 重要程度: [☆/□]
- 词性: [形容词/动词/名词...]
```

### 单义词卡片模板

```
词条: [日文] ([假名])
读音: [假名] / [罗马音]

释义: [释义内容]

例句:
- [日语例句]
  [中文翻译]

- [日语例句]
  [中文翻译]

属性:
- 重要程度: [☆/□]
- 词性: [形容词/动词/名词...]
```

---

## ✅ 验证清单

- [x] 形容词多义词正确合并为一张卡片
- [x] 每个释义独立显示并编号
- [x] 例句按释义分组显示
- [x] 形容动词数据加载正常
- [x] 外来语数据加载正常
- [x] 固定搭配数据加载正常
- [x] 代词例句正确分句(无","连接错误)
- [x] 其他词例句正确分句(无","连接错误)
- [x] 其他模块(名词、动词、副词)不受影响
- [x] CSS样式正确显示多义词
- [x] 向后兼容单一释义模式

---

## 🚀 使用说明

1. **启动服务器**:
   ```bash
   start.bat
   ```

2. **访问形容词模块**:
   - 打开 `http://localhost:8000/modules/adjective/index.html`
   - 查看多义词卡片是否正确合并

3. **测试其他模块**:
   - 形容动词: `/modules/adjectival-verb/index.html`
   - 外来语: `/modules/loanword/index.html`
   - 固定搭配: `/modules/fixed-collocations/index.html`

4. **验证功能**:
   - 点击卡片展开查看多义词
   - 点击读音播放语音
   - 测试收藏功能
   - 测试筛选功能

---

## 📝 技术要点

### 1. 数据合并策略
- 使用 `wordGroups` 对象按词条分组
- 每个词条收集所有释义和对应例句
- 最后转换为数组格式

### 2. 兼容性设计
- 自动检测 `data.meanings` 数组
- 多义词模式 vs 单一释义模式自动切换
- 不影响现有模块的正常运行

### 3. 字段映射表

| 模块 | 原始字段 | 目标字段 |
|------|---------|---------|
| 形容词 | `日文汉字`、`日文` | `word`、`kana` |
| 形容动词 | `日文汉字`、`日文假名` | `word`、`kana` |
| 外来语 | `外来语` | `word`、`kana` |
| 固定搭配 | `固定搭配` | `word`、`kana` |
| 通用 | `例句列表` | `examples[]` |

---

## 🎉 完成

所有问题已修复,系统现已支持:
- ✅ 多义词卡片正确合并
- ✅ 释义分组显示
- ✅ 例句按释义关联
- ✅ 所有模块数据正常加载
- ✅ RemNote 兼容的卡片结构
