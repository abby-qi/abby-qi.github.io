class OtherWordModule {
    constructor() {
        this.moduleType = 'other-word';
        this.allWords = [];
        this.currentCategory = 'all';
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
            console.log(`[OtherWordModule] 初始化完成，共 ${this.allWords.length} 个其他词`);
        } catch (error) {
            console.error('[OtherWordModule] 初始化失败:', error);
            this.showError(error.message);
        }
    }

    async loadData() {
        this.showLoading();
        const rawData = await window.RiyuCommon.DataLoader.loadJson('data/other-word.json');
        this.allWords = rawData.map((item, index) => {
            const pos1 = item['词性一'] || '';
            const pos2 = item['词性二'] || '';
            const pos3 = item['词性三'] || '';
            let category = '其他';
            
            // 根据词性判断词类
            if (pos1 === '接续') {
                category = '接续词';
            } else if (pos1.includes('接') && pos1 !== '接头' && pos1 !== '接尾') {
                category = '连词';
            } else if (pos1 === '叹') {
                category = '感叹词';
            } else if (pos1 === '接头') {
                category = '接头词';
            } else if (pos1 === '接尾') {
                category = '接尾词';
            } else if (pos1 === '连体') {
                category = '连体词';
            }
            
            return {
                id: index + 1,
                word: item['日文汉字'] || item['日文'],
                kana: item['日文'],
                meaning: item['释义'] || '',
                examples: (item['例句'] && Array.isArray(item['例句'])) 
                    ? item['例句'].map((jp, idx) => ({
                        jp: jp,
                        cn: item['例句翻译']?.[idx] || ''
                    })) 
                    : [],
                category: category
            };
        });
        this.isLoaded = true;
    }

    renderCards() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = '';
        this.currentCards = [];

        this.filteredWords = this.allWords.filter(w =>
            this.currentCategory === 'all' || w.category === this.currentCategory
        );
        
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
                onExpand: (data, isExpanded) => {
                    if (isExpanded) {
                        window.RiyuCommon.ProgressManager.addToRecent(this.moduleType, data.id);
                        window.RiyuCommon.ProgressManager.recordStudy(this.moduleType, data.id);
                    }
                }
            });
            container.appendChild(card);
            this.currentCards.push(card);
        });

        // 渲染分页控件
        this.renderPagination();

        console.log(`[OtherWordModule] 渲染了第 ${this.currentPage}/${this.totalPages} 页，共 ${this.currentCards.length} 个卡片`);
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

    bindEvents() {
        document.querySelectorAll('#categoryFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#categoryFilters .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderCards();
            });
        });

        document.getElementById('randomBtn').addEventListener('click', () => {
            if (this.currentCards.length === 0) {
                alert('当前没有可抽查的卡片');
                return;
            }
            const randomCard = this.currentCards[Math.floor(Math.random() * this.currentCards.length)];
            window.RiyuComponents.CardComponent.highlightCard(randomCard, 3000);
        });
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
        document.getElementById('cardsContainer').innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-inbox"></i>
                <p>没有找到符合条件的其他词</p>
            </div>
        `;
    }

    showError(message) {
        this.hideLoading();
        document.getElementById('cardsContainer').innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle" style="color: #ff6b6b;"></i>
                <p style="color: #ff6b6b;">加载失败</p>
                <p class="hint">${message}</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.otherWordModule = new OtherWordModule();
});
