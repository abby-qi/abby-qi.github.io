/**
 * 名词模块 - 主逻辑
 * 使用统一平台提供的共享组件和工具
 */

class NounModule {
    constructor() {
        this.moduleType = 'noun';
        this.allWords = [];
        this.currentLevel = 'all';
        this.currentCharCount = 'all';
        this.currentCards = [];
        this.isLoaded = false;
        
        // 分页相关
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 1;
        this.filteredWords = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderCards();
            this.bindEvents();
            this.hideLoading();
            console.log(`[NounModule] 初始化完成，共 ${this.allWords.length} 个单词`);
        } catch (error) {
            console.error('[NounModule] 初始化失败:', error);
            this.showError(error.message);
        }
    }

    async loadData() {
        this.showLoading();
        this.allWords = await window.RiyuCommon.DataLoader.loadJson('data/noun.json');
        this.isLoaded = true;
    }

    renderCards() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = '';
        this.currentCards = [];

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

        currentPageWords.forEach(word => {
            const card = window.RiyuComponents.CardComponent.createWordCard(word, {
                moduleType: this.moduleType,
                onFavorite: (data, isFavorite) => {
                    console.log(`[NounModule] ${data.word} ${isFavorite ? '已收藏' : '已取消收藏'}`);
                },
                onExpand: (data, isExpanded) => {
                    if (isExpanded) {
                        window.RiyuCommon.ProgressManager.addToRecent(this.moduleType, data.id);
                        window.RiyuCommon.ProgressManager.recordStudy(this.moduleType, data.id);
                    }
                },
                onSpeak: (data) => {
                    console.log(`[NounModule] 播放语音: ${data.word}`);
                }
            });

            container.appendChild(card);
            this.currentCards.push(card);
        });

        // 渲染分页控件
        this.renderPagination();

        console.log(`[NounModule] 渲染了第 ${this.currentPage}/${this.totalPages} 页，共 ${this.currentCards.length} 个卡片`);
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

    filterWords() {
        return this.allWords.filter(word => {
            // 等级筛选
            const levelMatch = this.currentLevel === 'all' || word.level === this.currentLevel;

            // 汉字数量筛选
            const charCount = (word.word || '').replace(/[^\u4e00-\u9fa5]/g, '').length;
            let charCountMatch = true;

            switch (this.currentCharCount) {
                case '1':
                    charCountMatch = charCount === 1;
                    break;
                case '2':
                    charCountMatch = charCount === 2;
                    break;
                case '3+':
                    charCountMatch = charCount >= 3;
                    break;
                case 'other':
                    charCountMatch = charCount === 0;
                    break;
                case 'all':
                default:
                    charCountMatch = true;
            }

            return levelMatch && charCountMatch;
        });
    }

    bindEvents() {
        // 等级筛选事件
        document.querySelectorAll('#levelFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleLevelFilterChange(e.target);
            });
        });

        // 汉字数量筛选事件
        document.querySelectorAll('#charCountFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCharCountFilterChange(e.target);
            });
        });

        // 随机抽查事件
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.handleRandomCheck();
        });
    }

    handleLevelFilterChange(targetBtn) {
        // 更新按钮状态
        document.querySelectorAll('#levelFilters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        targetBtn.classList.add('active');

        // 更新筛选条件
        this.currentLevel = targetBtn.dataset.level;

        // 重新渲染
        this.renderCards();

        console.log(`[NounModule] 等级筛选: ${this.currentLevel}`);
    }

    handleCharCountFilterChange(targetBtn) {
        // 更新按钮状态
        document.querySelectorAll('#charCountFilters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        targetBtn.classList.add('active');

        // 更新筛选条件
        this.currentCharCount = targetBtn.dataset.charCount;

        // 重新渲染
        this.renderCards();

        console.log(`[NounModule] 汉字数量筛选: ${this.currentCharCount}`);
    }

    handleRandomCheck() {
        if (this.currentCards.length === 0) {
            alert('当前没有可抽查的卡片，请调整筛选条件');
            return;
        }

        // 随机选择一个卡片
        const randomIndex = Math.floor(Math.random() * this.currentCards.length);
        const randomCard = this.currentCards[randomIndex];

        // 高亮显示
        window.RiyuComponents.CardComponent.highlightCard(randomCard, 3000);

        console.log(`[NounModule] 随机抽查: ${randomCard.dataset.id}`);
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
                <p>没有找到符合条件的单词</p>
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
    window.nounModule = new NounModule();
});
