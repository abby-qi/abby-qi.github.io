# 快速开始指南

## 🚀 快速启动

### Windows用户
1. 双击 `start.bat`
2. 浏览器会自动打开 http://localhost:8000/index-iframe.html

### Mac/Linux用户
```bash
chmod +x start.sh
./start.sh
```
然后访问: http://localhost:8000/index-iframe.html

## 📖 为什么有两个入口？

### index-iframe.html（推荐）✅
- 完全兼容所有9个子项目
- 使用iframe加载，互不干扰
- 所有功能都能正常使用
- 100%复用原始代码

### index.html（整合版）⚠️
- 真正的统一架构
- 需要进一步适配模块
- 部分功能可能不可用
- 适合开发者定制

## 💡 使用建议

**初次使用**: 直接访问 `index-iframe.html`

**开发者**: 可以研究 `index.html` 的整合方案，为后续优化做准备

## 📁 项目结构说明

```
riYu/
├── index-iframe.html      ← 推荐使用这个（完全兼容）
├── index.html              ← 整合版本（需适配）
├── start.bat / start.sh    ← 启动脚本
├── test.html               ← 功能测试页面
├── README.md               ← 详细文档
├── core/                   ← 核心系统（整合版使用）
├── modules/                ← 模块资源（整合版使用）
└── [原始9个子项目]        ← 原始项目保留
    ├── riYu_SIJI/          ← 名词
    ├── riYu_verb/          ← 动词
    ├── riyu_ADJ/           ← 形容词
    ├── riYu_adjectival_verb/ ← 形容动词
    ├── riYu_ADV/           ← 副词
    ├── riyu_pron_word/     ← 代词
    ├── riyu_other_word/    ← 其他词
    ├── riYu_loanword/      ← 外来语
    └── riyu_Fixed_collocations/ ← 固定搭配
```

## 🔧 常见问题

### Q: 点击模块后页面空白？
A: 确保使用HTTP服务器运行，不能直接双击HTML文件

### Q: 发音功能不工作？
A: 部分浏览器需要先与页面交互才能播放音频，点击页面任意位置即可

### Q: 学习进度不保存？
A: 使用LocalStorage存储，清除浏览器缓存会丢失数据

## 📞 获取帮助

- 查看 `README.md` 获取详细文档
- 查看 `PROJECT_STATUS.md` 了解项目状态
- 访问 `test.html` 测试基础功能

---

祝你学习愉快！📚✨
