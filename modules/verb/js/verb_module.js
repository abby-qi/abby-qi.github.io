/**
 * 动词模块 - 主逻辑
 */

class VerbModule {
    constructor() {
        this.moduleType = 'verb';
        this.allVerbs = [];
        this.currentClass = 'all';
        this.currentType = 'all';
        this.currentImportance = 'all';
        this.currentCards = [];
        this.isLoaded = false;
        
        // 分页相关
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 1;
        this.filteredVerbs = [];

        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderCards();
            this.bindEvents();
            this.hideLoading();
            console.log(`[VerbModule] 初始化完成，共 ${this.allVerbs.length} 个动词`);
        } catch (error) {
            console.error('[VerbModule] 初始化失败:', error);
            this.showError(error.message);
        }
    }

    async loadData() {
        this.showLoading();
        const rawData = await window.RiyuCommon.DataLoader.loadJson('data/verb.json');
        // 转换数据格式
        this.allVerbs = rawData.map((verb, index) => ({
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
            importance: verb['重要程度'] || '□',
            class: verb['动词分类'] || ''
        }));
        this.isLoaded = true;
    }

    renderCards() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = '';
        this.currentCards = [];

        this.filteredVerbs = this.filterVerbs();
        
        // 计算分页
        this.totalPages = Math.ceil(this.filteredVerbs.length / this.pageSize);
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }

        if (this.filteredVerbs.length === 0) {
            this.showEmptyState();
            this.renderPagination();
            return;
        }

        // 获取当前页数据
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const currentPageVerbs = this.filteredVerbs.slice(startIndex, endIndex);

        currentPageVerbs.forEach(verb => {
            const card = this.createVerbCard(verb);
            container.appendChild(card);
            this.currentCards.push(card);
        });

        // 渲染分页控件
        this.renderPagination();

        console.log(`[VerbModule] 渲染了第 ${this.currentPage}/${this.totalPages} 页，共 ${this.currentCards.length} 个卡片`);
    }
    
    renderPagination() {
        // 检查是否已有分页容器
        let paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'paginationContainer';
            paginationContainer.className = 'pagination-container';
            
            // 插入到卡片容器下方
            const cardsContainer = document.getElementById('cardsContainer');
            cardsContainer.parentNode.insertBefore(paginationContainer, cardsContainer.nextSibling);
        }
        
        // 如果没有数据，隐藏分页
        if (this.filteredVerbs.length === 0) {
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
                    第 ${this.currentPage} 页 / 共 ${this.totalPages} 页
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
            
            this.renderCards();
        });
    }

    createVerbCard(verb) {
        // 转换动词数据格式以匹配CardComponent期望的格式
        const verbData = {
            id: verb.id,
            word: verb.word,
            kana: verb.kana,
            meaning: verb.meaning,
            examples: verb.examples,
            level: verb.class, // 使用class作为level，显示在左侧
            category: verb.category ? `${verb.category}动词` : '', // 使用category作为category，显示在右侧
            importance: verb.importance
        };

        // 使用CardComponent创建卡片
        const card = window.RiyuComponents.CardComponent.createWordCard(verbData, {
            moduleType: this.moduleType,
            onFavorite: (data, isFavorite) => {
                console.log(`[VerbModule] ${data.word} ${isFavorite ? '已收藏' : '已取消收藏'}`);
            },
            onExpand: (data, isExpanded) => {
                if (isExpanded) {
                    window.RiyuCommon.ProgressManager.addToRecent(this.moduleType, data.id);
                    window.RiyuCommon.ProgressManager.recordStudy(this.moduleType, data.id);
                }
            },
            onSpeak: (data) => {
                console.log(`[VerbModule] 播放语音: ${data.word}`);
            }
        });

        return card;
    }

    bindCardEvents(card, verb) {
        // 不再需要手动绑定事件，因为CardComponent已经内置了事件绑定
        // 但如果需要添加额外的事件处理，可以在这里添加
    }

    filterVerbs() {
        return this.allVerbs.filter(verb => {
            // 动词分类筛选
            const classMatch = this.currentClass === 'all' || verb.class === this.currentClass;

            // 词性筛选
            const typeMatch = this.currentType === 'all' || verb.category === this.currentType;

            // 重要程度筛选
            const importanceMatch = this.currentImportance === 'all' || verb.importance === this.currentImportance;

            return classMatch && typeMatch && importanceMatch;
        });
    }

    bindEvents() {
        // 动词分类筛选事件
        document.querySelectorAll('#classFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e.target, 'class'));
        });

        // 词性筛选事件
        document.querySelectorAll('#typeFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e.target, 'type'));
        });

        // 重要程度筛选事件
        document.querySelectorAll('#importanceFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e.target, 'importance'));
        });

        // 随机抽查事件
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.handleRandomCheck();
        });
    }

    handleFilterChange(targetBtn, filterType) {
        const filterId = filterType + 'Filters';
        document.querySelectorAll(`#${filterId} .filter-btn`).forEach(btn => {
            btn.classList.remove('active');
        });
        targetBtn.classList.add('active');

        switch(filterType) {
            case 'class':
                this.currentClass = targetBtn.dataset.class;
                break;
            case 'type':
                this.currentType = targetBtn.dataset.type;
                break;
            case 'importance':
                this.currentImportance = targetBtn.dataset.importance;
                break;
        }

        this.renderCards();
        console.log(`[VerbModule] ${filterType}筛选:`, targetBtn.textContent);
    }

    handleRandomCheck() {
        if (this.currentCards.length === 0) {
            alert('当前没有可抽查的卡片，请调整筛选条件');
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.currentCards.length);
        const randomCard = this.currentCards[randomIndex];

        window.RiyuComponents.CardComponent.highlightCard(randomCard, 3000);

        console.log(`[VerbModule] 随机抽查: ${randomCard.dataset.id}`);
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('active');
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.remove('active');
    }

    showEmptyState() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-inbox"></i>
                <p>没有找到符合条件的动词</p>
                <p class="hint">请尝试调整筛选条件</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('cardsContainer');
        this.hideLoading();
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle" style="color: #ff6b6b;"></i>
                <p style="color: #ff6b6b;">加载失败</p>
                <p class="hint">${message}</p>
            </div>
        `;
    }
}

// 初始化模块
document.addEventListener('DOMContentLoaded', () => {
    window.verbModule = new VerbModule();
});
