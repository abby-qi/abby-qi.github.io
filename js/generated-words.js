/**
 * 生成的单词页面 - 主逻辑
 * 加载选中的单词，显示并支持点读功能
 */

class GeneratedWords {
    constructor() {
        this.selectedWords = [];
        this.allModules = [];
        this.allWords = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            this.isLoading = true;
            await this.loadSelectedWords();
            await this.loadAllModules();
            await this.loadAllWords();
            this.renderWords();
            this.bindEvents();
            console.log('[GeneratedWords] 初始化完成，共加载', this.selectedWords.length, '个选中的单词');
        } catch (error) {
            console.error('[GeneratedWords] 初始化失败:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 加载选中的单词
    loadSelectedWords() {
        return new Promise((resolve, reject) => {
            const selectedKeys = window.RiyuCommon.StorageHelper.get('selected_words', []);
            if (!selectedKeys || selectedKeys.length === 0) {
                reject(new Error('没有选中的单词，请先选择单词'));
                return;
            }
            this.selectedWords = selectedKeys;
            resolve();
        });
    }

    // 加载所有模块配置
    loadAllModules() {
        return new Promise((resolve) => {
            this.allModules = window.RiyuCommon.StatisticsManager.getModules();
            resolve();
        });
    }

    // 加载所有模块的单词数据
    async loadAllWords() {
        this.allWords = [];
        
        for (const module of this.allModules) {
            try {
                const words = await window.RiyuCommon.DataLoader.loadJson(`modules/${module.type}/data/${module.type}.json`);
                // 为每个单词添加模块信息并转换数据格式
                const moduleWords = this.convertModuleData(words, module.type, module.name);
                this.allWords = [...this.allWords, ...moduleWords];
                console.log(`[GeneratedWords] 加载 ${module.name} 模块: ${moduleWords.length} 个单词`);
            } catch (error) {
                console.error(`[GeneratedWords] 加载 ${module.name} 模块失败:`, error);
            }
        }
    }

    // 根据模块类型转换数据格式
    convertModuleData(words, moduleType, moduleName) {
        switch (moduleType) {
            case 'verb':
                // 动词模块数据转换
                return words.map((verb, index) => ({
                    id: index + 1,
                    word: verb['日文汉字'] || verb['日文假名'],
                    kana: verb['日文假名'],
                    meaning: verb['meanings']?.map(m => m.text).join('；') || '',
                    examples: verb['meanings']?.flatMap(m =>
                        (m.examples || []).map(e => ({
                            jp: e.japanese,
                            cn: e.chinese
                        }))
                    ) || [],
                    level: verb['动词分类'] || '',
                    category: verb['词性'] || '',
                    moduleType: moduleType,
                    moduleName: moduleName
                }));
            
            case 'adjective':
                // 形容词模块数据转换
                const adjectiveGroups = {};
                words.forEach((item, index) => {
                    const word = item['日文汉字'] || item['日文'];
                    const kana = item['日文']?.split('【')[0];
                    
                    if (!adjectiveGroups[word]) {
                        adjectiveGroups[word] = {
                            id: Object.keys(adjectiveGroups).length + 1,
                            word: word,
                            kana: kana,
                            meanings: [],
                            importance: item['重要程度'] || '□',
                            category: item['重要程度'] || '',
                            moduleType: moduleType,
                            moduleName: moduleName
                        };
                    }
                    
                    // 添加释义和对应的例句
                    adjectiveGroups[word].meanings.push({
                        text: item['释义'] || '',
                        examples: item['例句'] ? [{
                            jp: item['例句'],
                            cn: item['例句翻译']
                        }] : []
                    });
                });
                return Object.values(adjectiveGroups);
            
            case 'adjectival-verb':
                // 形容动词模块数据转换
                const adjectivalGroups = {};
                words.forEach((item, index) => {
                    const word = item['日文汉字'] || item['日文'];
                    const kana = item['日文']?.split('【')[0];
                    
                    if (!adjectivalGroups[word]) {
                        adjectivalGroups[word] = {
                            id: Object.keys(adjectivalGroups).length + 1,
                            word: word,
                            kana: kana,
                            meanings: [],
                            importance: item['重要程度'] || '□',
                            category: item['重要程度'] || '',
                            moduleType: moduleType,
                            moduleName: moduleName
                        };
                    }
                    
                    // 添加释义和对应的例句
                    adjectivalGroups[word].meanings.push({
                        text: item['释义'] || '',
                        examples: item['例句'] ? [{
                            jp: item['例句'],
                            cn: item['例句翻译']
                        }] : []
                    });
                });
                return Object.values(adjectivalGroups);
            
            case 'adverb':
                // 副词模块数据转换
                const adverbGroups = {};
                words.forEach((item, index) => {
                    const word = item['日文汉字'] || item['日文'];
                    const kana = item['日文']?.split('【')[0];
                    
                    if (!adverbGroups[word]) {
                        adverbGroups[word] = {
                            id: Object.keys(adverbGroups).length + 1,
                            word: word,
                            kana: kana,
                            meanings: [],
                            importance: item['重要程度'] || '□',
                            category: item['词性一'] || '',
                            moduleType: moduleType,
                            moduleName: moduleName
                        };
                    }
                    
                    // 添加释义和对应的例句
                    adverbGroups[word].meanings.push({
                        text: item['释义'] || '',
                        examples: item['例句'] ? item['例句'].map(e => ({
                            jp: e.例句,
                            cn: e.例句翻译
                        })) : []
                    });
                });
                return Object.values(adverbGroups);
            
            case 'loanword':
                // 外来语模块数据转换
                return words.map((item, index) => ({
                    id: index + 1,
                    word: item['外来语'] || '',
                    kana: item['外来语'] || '',
                    meaning: item['释义'] || '',
                    examples: item['例句'] ? [{
                        jp: item['例句'],
                        cn: item['例句翻译']
                    }] : [],
                    importance: item['重要程度'] || '□',
                    category: '外来语',
                    moduleType: moduleType,
                    moduleName: moduleName
                }));
            
            case 'fixed-collocations':
                // 固定搭配模块数据转换
                return words.map((item, index) => ({
                    id: index + 1,
                    word: item['固定搭配'] || '',
                    kana: '',
                    meaning: item['释义'] || '',
                    examples: [],
                    importance: item['重要程度'] || '□',
                    category: '固定搭配',
                    moduleType: moduleType,
                    moduleName: moduleName
                }));
            
            case 'pronoun':
            case 'other-word':
                // 检查是否有特殊格式
                if (words.length > 0) {
                    // 检查是否是副词格式
                    if (words[0]['日文汉字']) {
                        // 使用副词格式的数据转换
                        const groups = {};
                        words.forEach((item, index) => {
                            const word = item['日文汉字'] || item['日文'];
                            const kana = item['日文']?.split('【')[0];
                            
                            if (!groups[word]) {
                                groups[word] = {
                                    id: Object.keys(groups).length + 1,
                                    word: word,
                                    kana: kana,
                                    meanings: [],
                                    importance: item['重要程度'] || '□',
                                    category: item['词性一'] || '',
                                    moduleType: moduleType,
                                    moduleName: moduleName
                                };
                            }
                            
                            // 添加释义和对应的例句
                            groups[word].meanings.push({
                                text: item['释义'] || '',
                                examples: item['例句'] ? item['例句'].map(e => ({
                                    jp: e.例句,
                                    cn: e.例句翻译
                                })) : []
                            });
                        });
                        return Object.values(groups);
                    } else if (words[0]['日文']) {
                        // 使用形容词格式的数据转换
                        const groups = {};
                        words.forEach((item, index) => {
                            const word = item['日文汉字'] || item['日文'];
                            const kana = item['日文']?.split('【')[0];
                            
                            if (!groups[word]) {
                                groups[word] = {
                                    id: Object.keys(groups).length + 1,
                                    word: word,
                                    kana: kana,
                                    meanings: [],
                                    importance: item['重要程度'] || '□',
                                    category: item['重要程度'] || '',
                                    moduleType: moduleType,
                                    moduleName: moduleName
                                };
                            }
                            
                            // 添加释义和对应的例句
                            groups[word].meanings.push({
                                text: item['释义'] || '',
                                examples: item['例句'] ? [{
                                    jp: item['例句'],
                                    cn: item['例句翻译']
                                }] : []
                            });
                        });
                        return Object.values(groups);
                    } else {
                        // 使用名词格式的数据转换
                        return words.map((word, index) => ({
                            ...word,
                            id: word.id || index + 1,
                            moduleType: moduleType,
                            moduleName: moduleName
                        }));
                    }
                }
                return [];
            
            case 'noun':
            default:
                // 名词模块和其他模块使用默认格式
                return words.map((word, index) => ({
                    ...word,
                    id: word.id || index + 1,
                    moduleType: moduleType,
                    moduleName: moduleName
                }));
        }
    }

    // 获取选中的单词数据
    getSelectedWordsData() {
        const selectedData = [];
        
        this.selectedWords.forEach(key => {
            const [moduleType, wordId] = key.split(':');
            try {
                const word = this.allWords.find(w => {
                    // 安全检查id字段
                    if (!w || !w.moduleType) return false;
                    if (w.moduleType !== moduleType) return false;
                    
                    // 安全比较id
                    const wId = w.id;
                    if (wId === undefined || wId === null) return false;
                    return wId.toString() === wordId.toString();
                });
                if (word) {
                    selectedData.push(word);
                }
            } catch (error) {
                console.error('[GeneratedWords] 处理单词时出错:', error, 'Key:', key);
            }
        });
        
        return selectedData;
    }

    // 按模块分组单词
    groupWordsByModule(words) {
        const grouped = {};
        
        words.forEach(word => {
            const moduleType = word.moduleType;
            if (!grouped[moduleType]) {
                grouped[moduleType] = {
                    name: word.moduleName,
                    words: []
                };
            }
            grouped[moduleType].words.push(word);
        });
        
        return grouped;
    }

    // 渲染单词
    renderWords() {
        const container = document.getElementById('generatedContainer');
        container.innerHTML = '';
        
        const selectedData = this.getSelectedWordsData();
        if (selectedData.length === 0) {
            this.showEmptyState();
            return;
        }
        
        const groupedWords = this.groupWordsByModule(selectedData);
        
        // 按模块渲染
        Object.entries(groupedWords).forEach(([moduleType, moduleData]) => {
            const moduleSection = this.createModuleSection(moduleType, moduleData);
            container.appendChild(moduleSection);
        });
    }

    // 创建模块部分
    createModuleSection(moduleType, moduleData) {
        const section = document.createElement('div');
        section.className = 'words-section';
        section.dataset.module = moduleType;
        
        // 模块标题
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.innerHTML = `<i class="fas fa-book"></i> ${moduleData.name}`;
        section.appendChild(title);
        
        // 单词网格
        const grid = document.createElement('div');
        grid.className = 'words-grid';
        
        // 渲染单词卡片
        moduleData.words.forEach(word => {
            const card = this.createWordCard(word);
            grid.appendChild(card);
        });
        
        section.appendChild(grid);
        return section;
    }

    // 创建单词卡片
    createWordCard(word) {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.dataset.id = word.id;
        card.dataset.module = word.moduleType;
        
        // 获取单词的发音文本
        const speakText = word.kana || word.romaji || word.word;
        
        // 获取释义
        let meaningHtml = '';
        if (word.meanings && word.meanings.length > 0) {
            meaningHtml = word.meanings.map((m, index) => `
                <div class="meaning-item">
                    <div class="meaning-text">${index + 1}. ${m.text}</div>
                </div>
            `).join('');
        } else if (word.meaning) {
            meaningHtml = `<div class="meaning-item"><div class="meaning-text">${word.meaning}</div></div>`;
        }
        
        // 获取例句
        let exampleHtml = '';
        if (word.meanings && word.meanings.length > 0) {
            word.meanings.forEach((m, index) => {
                if (m.examples && m.examples.length > 0) {
                    m.examples.forEach(example => {
                        exampleHtml += `
                            <div class="example-item">
                                <div class="example-jp" data-text="${example.jp}">
                                    <i class="fas fa-volume-up"></i>
                                    ${example.jp}
                                </div>
                                <div class="example-cn">${example.cn}</div>
                            </div>
                        `;
                    });
                }
            });
        } else if (word.examples && word.examples.length > 0) {
            word.examples.forEach(example => {
                exampleHtml += `
                    <div class="example-item">
                        <div class="example-jp" data-text="${example.jp}">
                            <i class="fas fa-volume-up"></i>
                            ${example.jp}
                        </div>
                        <div class="example-cn">${example.cn}</div>
                    </div>
                `;
            });
        }
        
        // 检查是否有等级和分类标签
        const levelTag = word.level ? `<div class="level-tag">${word.level}</div>` : '';
        const categoryTag = word.category ? `<div class="category-tag">${word.category}</div>` : '';
        
        card.innerHTML = `
            <div class="card-header">
                <!-- 左侧收藏按钮 -->
                <div class="favorite-container">
                    <button class="action-btn favorite-btn" data-action="favorite">
                        <i class="fas fa-regular fa-heart"></i>
                    </button>
                </div>

                <!-- 中间单词信息 -->
                <div class="word-info" data-text="${speakText}">
                    <div class="word-main">${word.word}</div>
                    ${word.kana ? `<div class="word-kana">${word.kana}</div>` : ''}
                </div>

                <!-- 右侧喇叭图标 -->
                <div class="audio-container">
                    <i class="fas fa-volume-up word-audio-icon"></i>
                </div>

                <!-- 左上角标签(等级标签) -->
                <div class="card-tags card-tags-left">
                    ${levelTag}
                </div>

                <!-- 右上角标签(分类标签) -->
                <div class="card-tags card-tags-right">
                    ${categoryTag}
                </div>
            </div>
            <div class="card-content">
                ${meaningHtml ? `
                    <div class="meaning-section">
                        <div class="meaning-title">
                            <i class="fas fa-info-circle"></i> 释义
                        </div>
                        ${meaningHtml}
                    </div>
                ` : ''}
                ${exampleHtml ? `
                    <div class="example-section">
                        <div class="example-title">
                            <i class="fas fa-comment"></i> 例句
                        </div>
                        ${exampleHtml}
                    </div>
                ` : ''}
            </div>
            <div class="expand-icon">
                <i class="fas fa-chevron-down"></i>
            </div>
        `;
        
        // 绑定展开/收起事件
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn') && 
                !e.target.closest('.audio-container') && 
                !e.target.closest('.example-jp')) {
                card.classList.toggle('expanded');
            }
        });
        
        return card;
    }

    // 绑定事件
    bindEvents() {
        // 单词发音事件 - 喇叭图标
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('word-audio-icon') || e.target.closest('.audio-container')) {
                const container = e.target.closest('.audio-container');
                if (container) {
                    const wordInfo = container.closest('.card-header').querySelector('.word-info');
                    const text = wordInfo?.dataset.text;
                    if (text) {
                        this.speak(text);
                    }
                }
            }
        });

        // 单词信息点击事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.word-info')) {
                const wordInfo = e.target.closest('.word-info');
                const text = wordInfo.dataset.text;
                if (text) {
                    this.speak(text);
                }
            }
        });
        
        // 例句发音事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('example-jp') || e.target.closest('.example-jp')) {
                const example = e.target.classList.contains('example-jp') ? e.target : e.target.closest('.example-jp');
                let text = example.dataset.text;
                if (text) {
                    // 移除开头的序号（如"1."、"2."等）
                    text = text.replace(/^\d+\.\s*/, '');
                    this.speak(text);
                }
            }
        });
        
        // 导出为Excel事件
        document.addEventListener('click', (e) => {
            if (e.target.id === 'exportExcelBtn' || e.target.closest('#exportExcelBtn')) {
                this.exportToExcel();
            }
        });
    }

    // 导出为Excel
    exportToExcel() {
        try {
            const selectedData = this.getSelectedWordsData();
            if (selectedData.length === 0) {
                alert('没有可导出的单词');
                return;
            }
            
            // 准备导出数据
            const exportData = [];
            
            // 添加表头
            exportData.push(['序号', '词性', '日文汉字', '日文假名', '中文释义', '例句一', '例句一释义', '例句二', '例句二释义', '例句三', '例句三释义']);
            
            // 添加数据行
            selectedData.forEach((word, index) => {
                // 获取中文释义
                let meaning = '';
                if (word.meanings && word.meanings.length > 0) {
                    meaning = word.meanings.map(m => m.text).join('；');
                } else if (word.meaning) {
                    meaning = word.meaning;
                }
                
                // 获取词性
                const category = word.category || word.level || '';
                
                // 获取例句和释义
                let examplesWithMeanings = [];
                if (word.meanings && word.meanings.length > 0) {
                    examplesWithMeanings = word.meanings.flatMap(m => 
                        (m.examples || []).map(e => ({
                            jp: e.jp || '',
                            cn: e.cn || ''
                        }))
                    );
                } else if (word.examples && word.examples.length > 0) {
                    examplesWithMeanings = word.examples.map(e => ({
                        jp: e.jp || '',
                        cn: e.cn || ''
                    }));
                }
                
                // 提取例句一、例句二、例句三及其释义
                const example1 = examplesWithMeanings[0]?.jp || '';
                const example1Meaning = examplesWithMeanings[0]?.cn || '';
                const example2 = examplesWithMeanings[1]?.jp || '';
                const example2Meaning = examplesWithMeanings[1]?.cn || '';
                const example3 = examplesWithMeanings[2]?.jp || '';
                const example3Meaning = examplesWithMeanings[2]?.cn || '';
                
                // 添加数据行
                exportData.push([
                    index + 1,
                    category,
                    word.word || '',
                    word.kana || '',
                    meaning,
                    example1,
                    example1Meaning,
                    example2,
                    example2Meaning,
                    example3,
                    example3Meaning
                ]);
            });
            
            // 生成CSV内容
            const csvContent = exportData.map(row => 
                row.map(cell => {
                    // 处理包含逗号、引号等特殊字符的情况
                    if (typeof cell === 'string') {
                        // 如果包含逗号、引号或换行符，需要用引号包裹
                        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                            // 替换双引号为两个双引号
                            cell = cell.replace(/"/g, '""');
                            // 用双引号包裹
                            cell = '"' + cell + '"';
                        }
                    }
                    return cell;
                }).join(',')
            ).join('\n');
            
            // 创建Blob对象
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            // 创建下载链接
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `日语单词_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('[GeneratedWords] 导出Excel成功，共导出', selectedData.length, '个单词');
        } catch (error) {
            console.error('[GeneratedWords] 导出Excel失败:', error);
            alert('导出失败，请重试');
        }
    }

    // 播放语音
    speak(text) {
        try {
            window.RiyuCommon.SpeechHelper.speak(text);
            console.log('[GeneratedWords] 播放语音:', text);
        } catch (error) {
            console.error('[GeneratedWords] 语音播放失败:', error);
        }
    }

    // 显示加载状态
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
    }

    // 隐藏加载状态
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    // 显示错误信息
    showError(message) {
        const container = document.getElementById('generatedContainer');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>加载失败</h3>
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="location.href='word-selector.html'">
                    <i class="fas fa-arrow-left"></i> 返回选择页面
                </button>
            </div>
        `;
    }

    // 显示空状态
    showEmptyState() {
        const container = document.getElementById('generatedContainer');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>没有选中的单词</h3>
                <p>请先到单词选择页面选择单词</p>
                <button class="btn btn-secondary" onclick="location.href='word-selector.html'">
                    <i class="fas fa-arrow-left"></i> 去选择单词
                </button>
            </div>
        `;
    }
}

// 初始化生成的单词页面
document.addEventListener('DOMContentLoaded', () => {
    window.generatedWords = new GeneratedWords();
});