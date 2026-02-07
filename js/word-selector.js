/**
 * 单词选择器 - 主逻辑
 * 加载所有模块的单词数据，支持选择功能
 */

class WordSelector {
    constructor() {
        this.allModules = [];
        this.allWords = [];
        this.selectedWords = new Set();
        this.isLoading = false;
        
        // 筛选和分页相关
        this.currentModule = 'all';
        this.currentSubFilter = {};
        this.currentPage = 1;
        this.pageSize = 40;
        this.filteredWords = [];
        this.totalPages = 1;
        
        this.init();
    }

    async init() {
        try {
            this.isLoading = true;
            await this.loadAllModules();
            await this.loadAllWords();
            this.renderModuleFilters();
            this.renderWords();
            this.bindEvents();
            this.updateSelectionCount();
            console.log('[WordSelector] 初始化完成，共加载', this.allWords.length, '个单词');
        } catch (error) {
            console.error('[WordSelector] 初始化失败:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 加载所有模块配置
    loadAllModules() {
        return new Promise((resolve) => {
            // 使用共享的模块配置
            this.allModules = window.RiyuCommon.StatisticsManager.getModules() || [];
            
            // 如果没有获取到模块配置，使用默认模块配置
            if (this.allModules.length === 0) {
                this.allModules = [
                    { type: 'noun', name: '名词' },
                    { type: 'verb', name: '动词' },
                    { type: 'adjective', name: '形容词' },
                    { type: 'adjectival-verb', name: '形容动词' },
                    { type: 'adverb', name: '副词' },
                    { type: 'pronoun', name: '代词' },
                    { type: 'other-word', name: '其他词' },
                    { type: 'loanword', name: '外来语' },
                    { type: 'fixed-collocations', name: '固定搭配' }
                ];
            }
            resolve();
        });
    }

    // 加载所有模块的单词数据
    async loadAllWords() {
        this.allWords = [];
        
        for (const module of this.allModules) {
            try {
                const words = await window.RiyuCommon.DataLoader.loadJson(`modules/${module.type}/data/${module.type}.json`);
                // 根据模块类型转换数据格式
                const moduleWords = this.convertModuleData(words, module.type, module.name);
                this.allWords = [...this.allWords, ...moduleWords];
                console.log(`[WordSelector] 加载 ${module.name} 模块: ${moduleWords.length} 个单词`);
            } catch (error) {
                console.error(`[WordSelector] 加载 ${module.name} 模块失败:`, error);
            }
        }
    }

    // 根据模块类型转换数据格式
    convertModuleData(words, moduleType, moduleName) {
        switch (moduleType) {
            case 'verb':
                // 动词模块数据转换 - 参考 verb/module.js
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
                    level: verb['重要程度'] || '',
                    category: verb['动词分类'] || '',
                    type: verb['词性'] === '自' ? '自动词' : (verb['词性'] === '他' ? '他动词' : ''),
                    moduleType: moduleType,
                    moduleName: moduleName
                }));
            
            case 'adjective':
                // 形容词模块数据转换 - 参考 adjective/module.js
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
                // 形容动词模块数据转换 - 参考 adjectival-verb/module.js
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
                        return words.map(word => ({
                            ...word,
                            moduleType: moduleType,
                            moduleName: moduleName
                        }));
                    }
                }
                return [];
            
            case 'noun':
                // 名词模块数据转换 - 直接使用原始格式
                return words.map(word => ({
                    ...word,
                    moduleType: moduleType,
                    moduleName: moduleName
                }));
            
            default:
                // 其他模块使用默认格式
                return words.map(word => ({
                    ...word,
                    moduleType: moduleType,
                    moduleName: moduleName
                }));
        }
    }

    // 渲染模块筛选按钮
    renderModuleFilters() {
        const container = document.getElementById('moduleFilters');
        if (!container) return;
        
        // 清空现有按钮
        container.innerHTML = '<button class="filter-btn active" data-module="all">全部</button>';
        
        // 添加模块筛选按钮
        this.allModules.forEach(module => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.module = module.type;
            button.textContent = module.name;
            container.appendChild(button);
        });
    }

    // 筛选单词
    filterWords() {
        let filtered = this.allWords;
        
        // 按模块筛选
        if (this.currentModule !== 'all') {
            filtered = filtered.filter(word => word.moduleType === this.currentModule);
        }
        
        // 按子筛选条件筛选
        if (this.currentModule !== 'all' && this.currentSubFilter[this.currentModule]) {
            const subFilter = this.currentSubFilter[this.currentModule];
            filtered = filtered.filter(word => {
                let keep = true;
                
                if (subFilter.category && word.category) {
                    keep = keep && (word.category === subFilter.category);
                }
                if (subFilter.level && word.level) {
                    keep = keep && (word.level === subFilter.level);
                }
                if (subFilter.verbType && word.moduleType === 'verb') {
                    // 检查动词词性
                    if (word.type) {
                        keep = keep && (word.type === subFilter.verbType);
                    } else if (word.meaning) {
                        keep = keep && (word.meaning.includes(subFilter.verbType));
                    }
                }
                
                return keep;
            });
        }
        
        return filtered;
    }

    // 渲染单词列表
    renderWords() {
        const container = document.getElementById('selectorContainer');
        container.innerHTML = '';

        // 筛选单词
        this.filteredWords = this.filterWords();
        
        // 计算分页
        this.totalPages = Math.ceil(this.filteredWords.length / this.pageSize);
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }

        if (this.filteredWords.length === 0) {
            this.showEmptyState();
            this.renderPagination();
            return;
        }

        // 获取当前页数据
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const currentPageWords = this.filteredWords.slice(startIndex, endIndex);

        // 渲染单词项
        const wordsGrid = document.createElement('div');
        wordsGrid.className = 'words-grid';

        currentPageWords.forEach(word => {
            const wordItem = this.createWordItem(word);
            wordsGrid.appendChild(wordItem);
        });

        container.appendChild(wordsGrid);

        // 渲染分页控件
        this.renderPagination();
    }

    // 渲染分页控件
    renderPagination() {
        // 检查是否已有分页容器
        let paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'paginationContainer';
            paginationContainer.className = 'pagination-container';
            
            // 插入到选择容器下方
            const selectorContainer = document.getElementById('selectorContainer');
            selectorContainer.parentNode.insertBefore(paginationContainer, selectorContainer.nextSibling);
        }
        
        // 如果没有数据，隐藏分页
        if (this.filteredWords.length === 0) {
            paginationContainer.innerHTML = '';
            paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'block';
        
        // 生成分页HTML
        let paginationHtml = `
            <div class="pagination">
                <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" data-page="prev">
                    <i class="fas fa-chevron-left"></i> 上一页
                </button>
                <div class="pagination-info">
                    第 ${this.currentPage} 页 / 共 ${this.totalPages} 页 (${this.filteredWords.length} 个单词)
                </div>
                <button class="pagination-btn ${this.currentPage === this.totalPages ? 'disabled' : ''}" data-page="next">
                    下一页 <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        paginationContainer.innerHTML = paginationHtml;
        
        // 绑定分页事件
        this.bindPaginationEvents();
    }

    // 绑定分页事件
    bindPaginationEvents() {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;
        
        // 移除之前的事件监听器，避免重复绑定
        paginationContainer.replaceWith(paginationContainer.cloneNode(true));
        const newPaginationContainer = document.getElementById('paginationContainer');
        
        newPaginationContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.pagination-btn');
            if (!btn || btn.classList.contains('disabled')) return;
            
            const pageType = btn.dataset.page;
            if (pageType === 'prev') {
                if (this.currentPage > 1) {
                    this.currentPage--;
                }
            } else if (pageType === 'next') {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                }
            }
            
            this.renderWords();
        });
    }

    // 创建单词选择项
    createWordItem(word) {
        const wordKey = `${word.moduleType}:${word.id}`;
        const isSelected = this.selectedWords.has(wordKey);

        const wordItem = document.createElement('div');
        wordItem.className = `selectable-word ${isSelected ? 'selected' : ''} ${word.moduleType}`;
        wordItem.dataset.key = wordKey;
        wordItem.dataset.module = word.moduleType;
        wordItem.dataset.id = word.id;

        // 获取单词的释义（支持多义词）
        let meaningText = '';
        if (word.meanings && word.meanings.length > 0) {
            meaningText = word.meanings.map(m => m.text).join('; ');
        } else if (word.meaning) {
            meaningText = word.meaning;
        }

        // 确保word.word存在
        const wordText = word.word || '未知单词';
        const kanaText = word.kana || '';

        // 构建卡片标签
        let tagsHtml = '';
        if (word.category) {
            tagsHtml += `<div class="card-tags card-tags-left">
                <span class="category-tag">${word.category}</span>
            </div>`;
        }
        if (word.level) {
            tagsHtml += `<div class="card-tags card-tags-right">
                <span class="level-tag">${word.level}</span>
            </div>`;
        }

        wordItem.innerHTML = `
            ${tagsHtml}
            <div class="word-info">
                <div class="word-main">${wordText}</div>
                ${kanaText ? `<div class="word-kana">${kanaText}</div>` : ''}
            </div>
            <div class="word-meaning">${meaningText || '暂无释义'}</div>
            <input type="checkbox" class="select-checkbox" ${isSelected ? 'checked' : ''}>
        `;

        // 绑定点击事件
        wordItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('select-checkbox')) {
                const checkbox = wordItem.querySelector('.select-checkbox');
                checkbox.checked = !checkbox.checked;
                this.toggleWordSelection(wordKey, checkbox.checked);
            }
        });

        // 绑定复选框事件
        const checkbox = wordItem.querySelector('.select-checkbox');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            this.toggleWordSelection(wordKey, checkbox.checked);
        });

        return wordItem;
    }

    // 切换单词选择状态
    toggleWordSelection(wordKey, isSelected) {
        if (isSelected) {
            this.selectedWords.add(wordKey);
        } else {
            this.selectedWords.delete(wordKey);
        }
        this.updateSelectionCount();
        this.updateWordItemState(wordKey, isSelected);
    }

    // 更新单词项的选择状态
    updateWordItemState(wordKey, isSelected) {
        const wordItem = document.querySelector(`.selectable-word[data-key="${wordKey}"]`);
        if (wordItem) {
            wordItem.classList.toggle('selected', isSelected);
            const checkbox = wordItem.querySelector('.select-checkbox');
            if (checkbox) {
                checkbox.checked = isSelected;
            }
        }
    }

    // 更新选择计数
    updateSelectionCount() {
        const count = this.selectedWords.size;
        document.getElementById('selectedCount').textContent = count;
    }

    // 全选
    selectAll() {
        const allWordItems = document.querySelectorAll('.selectable-word');
        allWordItems.forEach(item => {
            const wordKey = item.dataset.key;
            this.selectedWords.add(wordKey);
            this.updateWordItemState(wordKey, true);
        });
        this.updateSelectionCount();
        console.log('[WordSelector] 全选完成，共选择', this.selectedWords.size, '个单词');
    }

    // 取消全选
    deselectAll() {
        const allWordItems = document.querySelectorAll('.selectable-word');
        allWordItems.forEach(item => {
            const wordKey = item.dataset.key;
            this.selectedWords.delete(wordKey);
            this.updateWordItemState(wordKey, false);
        });
        this.updateSelectionCount();
        console.log('[WordSelector] 取消全选完成');
    }

    // 反选
    invertSelection() {
        const allWordItems = document.querySelectorAll('.selectable-word');
        allWordItems.forEach(item => {
            const wordKey = item.dataset.key;
            const isSelected = this.selectedWords.has(wordKey);
            this.toggleWordSelection(wordKey, !isSelected);
        });
        console.log('[WordSelector] 反选完成，共选择', this.selectedWords.size, '个单词');
    }

    // 清空选择
    clearSelection() {
        this.deselectAll();
    }

    // 保存选中的单词
    saveSelectedWords() {
        // 转换为数组
        const selectedArray = Array.from(this.selectedWords);
        
        // 保存到 localStorage
        window.RiyuCommon.StorageHelper.set('selected_words', selectedArray);
        console.log('[WordSelector] 保存选中的单词:', selectedArray.length, '个');
    }

    // 生成页面
    generatePage() {
        if (this.selectedWords.size === 0) {
            alert('请先选择单词');
            return;
        }

        // 保存选中的单词
        this.saveSelectedWords();
        
        // 跳转到生成的页面
        window.location.href = 'generated-words.html';
    }

    // 生成子筛选条件
    generateSubFilters() {
        // 检查是否存在子筛选容器
        let subFilterContainer = document.getElementById('subFilterContainer');
        if (!subFilterContainer) {
            subFilterContainer = document.createElement('div');
            subFilterContainer.id = 'subFilterContainer';
            subFilterContainer.className = 'filter-section sub-filter-container';
            
            // 插入到control-panel下方
            const controlPanel = document.querySelector('.control-panel');
            if (controlPanel) {
                controlPanel.parentNode.insertBefore(subFilterContainer, controlPanel.nextSibling);
            }
        }
        
        // 清空现有内容
        subFilterContainer.innerHTML = '';
        
        // 如果选择了全部模块，不显示子筛选
        if (this.currentModule === 'all') {
            return;
        }
        
        // 获取当前模块的单词
        const moduleWords = this.allWords.filter(word => word.moduleType === this.currentModule);
        
        // 提取分类、级别和动词词性
        const categories = new Set();
        const levels = new Set();
        const verbTypes = new Set();
        
        moduleWords.forEach(word => {
            if (word.category) categories.add(word.category);
            if (word.level) levels.add(word.level);
            // 提取动词词性（自动词/他动词）
            if (word.moduleType === 'verb') {
                // 假设动词词性存储在 word.type 或类似字段中
                // 这里需要根据实际数据结构调整
                if (word.type) verbTypes.add(word.type);
                // 或者从其他字段中提取
                if (word.meaning && (word.meaning.includes('自动词') || word.meaning.includes('他动词'))) {
                    if (word.meaning.includes('自动词')) verbTypes.add('自动词');
                    if (word.meaning.includes('他动词')) verbTypes.add('他动词');
                }
            }
        });
        
        // 生成子筛选HTML
        let subFilterHtml = '<span class="filter-label">进一步筛选：</span>';
        
        // 处理动词模块的特殊排序
        if (this.currentModule === 'verb') {
            // 分类排序：全部、~う、~く・ぐ、~す、~つ、~ぬ、~ぶ、~む、~る
            const categoryOrder = ['全部', '~う', '~く・ぐ', '~す', '~つ', '~ぬ', '~ぶ', '~む', '~る'];
            const sortedCategories = categoryOrder.filter(cat => cat === '全部' || categories.has(cat));
            
            // 级别排序：☆重要、□一般
            const sortedLevels = [];
            if (levels.has('☆')) sortedLevels.push('☆');
            if (levels.has('□')) sortedLevels.push('□');
            
            // 第一行：级别
            subFilterHtml += '<div class="filter-buttons level-filter">';
            
            // 添加级别筛选
            if (sortedLevels.length > 0) {
                subFilterHtml += '<div class="filter-group">';
                subFilterHtml += '<button class="filter-btn active" data-filter="level" data-value="all">全部级别</button>';
                sortedLevels.forEach(level => {
                    const levelText = level === '☆' ? '☆重要' : '□一般';
                    subFilterHtml += `<button class="filter-btn" data-filter="level" data-value="${level}">${levelText}</button>`;
                });
                subFilterHtml += '</div>';
            }
            
            subFilterHtml += '</div>';
            
            // 第二行：分类
            subFilterHtml += '<div class="filter-buttons category-filter">';
            
            // 添加分类筛选
            if (sortedCategories.length > 0) {
                subFilterHtml += '<div class="filter-group">';
                sortedCategories.forEach(category => {
                    if (category === '全部') {
                        subFilterHtml += '<button class="filter-btn active" data-filter="category" data-value="all">全部分类</button>';
                    } else {
                        subFilterHtml += `<button class="filter-btn" data-filter="category" data-value="${category}">${category}</button>`;
                    }
                });
                subFilterHtml += '</div>';
            }
            
            subFilterHtml += '</div>';
            
            // 第三行：动词词性
            subFilterHtml += '<div class="filter-buttons verb-type-filter">';
            
            // 添加动词词性筛选
            subFilterHtml += '<div class="filter-group">';
            subFilterHtml += '<button class="filter-btn active" data-filter="verbType" data-value="all">动词词性</button>';
            subFilterHtml += '<button class="filter-btn" data-filter="verbType" data-value="自动词">自动词</button>';
            subFilterHtml += '<button class="filter-btn" data-filter="verbType" data-value="他动词">他动词</button>';
            subFilterHtml += '</div>';
            
            subFilterHtml += '</div>';
            
            // 调整布局，确保filter-section换行
            subFilterHtml = '<div class="sub-filter-content">' + subFilterHtml + '</div>';
        } else {
            // 其他模块使用默认排序
            
            // 添加分类筛选
            if (categories.size > 0) {
                subFilterHtml += '<div class="filter-buttons category-filter">';
                subFilterHtml += '<div class="filter-group">';
                subFilterHtml += '<button class="filter-btn active" data-filter="category" data-value="all">全部分类</button>';
                categories.forEach(category => {
                    subFilterHtml += `<button class="filter-btn" data-filter="category" data-value="${category}">${category}</button>`;
                });
                subFilterHtml += '</div>';
                subFilterHtml += '</div>';
            }
            
            // 添加级别筛选
            if (levels.size > 0) {
                subFilterHtml += '<div class="filter-buttons level-filter">';
                subFilterHtml += '<div class="filter-group">';
                subFilterHtml += '<button class="filter-btn active" data-filter="level" data-value="all">全部级别</button>';
                levels.forEach(level => {
                    subFilterHtml += `<button class="filter-btn" data-filter="level" data-value="${level}">${level}</button>`;
                });
                subFilterHtml += '</div>';
                subFilterHtml += '</div>';
            }
            
            // 调整布局，确保filter-section换行
            subFilterHtml = '<div class="sub-filter-content">' + subFilterHtml + '</div>';
        }
        
        subFilterContainer.innerHTML = subFilterHtml;
        
        // 绑定子筛选事件
        this.bindSubFilterEvents();
    }

    // 绑定子筛选事件
    bindSubFilterEvents() {
        const subFilterContainer = document.getElementById('subFilterContainer');
        if (!subFilterContainer) return;
        
        subFilterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            
            const filterType = btn.dataset.filter;
            const filterValue = btn.dataset.value;
            
            // 更新按钮状态
            const buttons = subFilterContainer.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`);
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新子筛选条件
            if (!this.currentSubFilter[this.currentModule]) {
                this.currentSubFilter[this.currentModule] = {};
            }
            
            if (filterValue === 'all') {
                delete this.currentSubFilter[this.currentModule][filterType];
            } else {
                this.currentSubFilter[this.currentModule][filterType] = filterValue;
            }
            
            this.currentPage = 1; // 重置到第一页
            this.renderWords();
            console.log('[WordSelector] 子筛选:', filterType, filterValue);
        });
    }

    // 处理模块筛选
    handleModuleFilterChange(moduleType) {
        this.currentModule = moduleType;
        this.currentPage = 1; // 重置到第一页
        
        // 更新筛选按钮状态
        const buttons = document.querySelectorAll('#moduleFilters .filter-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.module === moduleType) {
                btn.classList.add('active');
            }
        });
        
        // 生成子筛选条件
        this.generateSubFilters();
        
        this.renderWords();
        console.log('[WordSelector] 模块筛选:', moduleType);
    }

    // 绑定事件
    bindEvents() {
        // 模块筛选事件
        document.getElementById('moduleFilters').addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                const moduleType = btn.dataset.module;
                this.handleModuleFilterChange(moduleType);
            }
        });

        // 全选按钮
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAll();
        });

        // 取消全选按钮
        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.deselectAll();
        });

        // 反选按钮
        document.getElementById('invertSelectionBtn').addEventListener('click', () => {
            this.invertSelection();
        });

        // 清空选择按钮
        document.getElementById('clearSelectionBtn').addEventListener('click', () => {
            this.clearSelection();
        });

        // 生成页面按钮
        document.getElementById('generatePageBtn').addEventListener('click', () => {
            this.generatePage();
        });
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

    // 显示空状态
    showEmptyState() {
        const container = document.getElementById('selectorContainer');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>没有找到符合条件的单词</p>
                <p class="hint">请尝试调整筛选条件</p>
            </div>
        `;
    }

    // 显示错误信息
    showError(message) {
        const container = document.getElementById('selectorContainer');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle" style="color: #ff6b6b;"></i>
                <p style="color: #ff6b6b;">加载失败</p>
                <p class="hint">${message}</p>
            </div>
        `;
    }
}

// 初始化单词选择器
document.addEventListener('DOMContentLoaded', () => {
    window.wordSelector = new WordSelector();
});