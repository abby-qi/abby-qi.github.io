/**
 * 日语学习平台 - 可复用组件
 * 提供跨模块共享的UI组件
 */

// ==================== 卡片组件 ====================
const CardComponent = {
    // 创建单词卡片
    createWordCard(data, options = {}) {
        const {
            moduleType = 'noun',
            onFavorite = null,
            onExpand = null,
            onSpeak = null
        } = options;

        const isFavorite = window.RiyuCommon.ProgressManager.isFavorite(moduleType, data.id);

        const card = document.createElement('div');
        card.className = 'word-card';
        card.dataset.id = data.id;
        card.dataset.module = moduleType;

        // 生成释义和例句组合HTML - 支持多义词
        let combinedHtml = '';
        if (data.meanings && data.meanings.length > 0) {
            // 多义词模式 - 每个释义下面跟对应的例句
            combinedHtml = data.meanings.map((m, idx) => {
                let exampleHtml = '';
                if (m.examples && m.examples.length > 0) {
                    exampleHtml = `
                        <div class="example-item">
                            <div class="example-jp" data-text="${m.examples[0].jp}">
                                <i class="fas fa-volume-up example-audio-icon"></i>
                                ${m.examples[0].jp}
                            </div>
                            <div class="example-cn">${m.examples[0].cn}</div>
                        </div>
                    `;
                } else {
                    exampleHtml = '<div class="example-jp">暂无例句</div>';
                }
                
                return `
                    <div class="meaning-example-group">
                        <div class="meaning-item">
                            <div class="meaning-number">${idx + 1}.</div>
                            <div class="meaning-text">${m.text}</div>
                        </div>
                        ${exampleHtml}
                    </div>
                `;
            }).join('');
        } else if (data.meaning) {
            // 单一释义模式
            let exampleHtml = '';
            if (data.examples && data.examples.length > 0) {
                exampleHtml = data.examples.map(example => `
                    <div class="example-item">
                        <div class="example-jp" data-text="${example.jp}">
                            <i class="fas fa-volume-up example-audio-icon"></i>
                            ${example.jp}
                        </div>
                        <div class="example-cn">${example.cn}</div>
                    </div>
                `).join('');
            } else {
                exampleHtml = '<div class="example-jp">暂无例句</div>';
            }
            
            combinedHtml = `
                <div class="meaning-example-group">
                    <div class="meaning-item">
                        <div class="meaning-text">${data.meaning}</div>
                    </div>
                    ${exampleHtml}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="card-header">
                <!-- 左侧收藏按钮 -->
                <div class="favorite-container">
                    <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" data-action="favorite">
                        <i class="fas ${isFavorite ? 'fa-heart' : 'fa-regular fa-heart'}"></i>
                    </button>
                </div>

                <!-- 中间单词信息 -->
                <div class="word-info" data-text="${data.kana || data.romaji || data.word}">
                    <div class="word-main">${data.word}</div>
                    ${data.kana ? `<div class="word-kana">${data.kana}</div>` : ''}
                </div>

                <!-- 右侧喇叭图标 -->
                <div class="audio-container">
                    <i class="fas fa-volume-up word-audio-icon"></i>
                </div>

                <!-- 左上角标签(等级标签) -->
                <div class="card-tags card-tags-left">
                    ${data.level ? `<div class="level-tag">${data.level}</div>` : ''}
                </div>

                <!-- 右上角标签(分类标签) -->
                <div class="card-tags card-tags-right">
                    ${data.category ? `<div class="category-tag">${data.category}</div>` : ''}
                </div>

                <!-- 展开图标 -->
                <div class="expand-icon">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="card-content">
                ${combinedHtml ? `
                    <div class="meaning-section">
                        <div class="section-title">
                            <i class="fas fa-book"></i> 释义与例句
                        </div>
                        ${combinedHtml}
                    </div>
                ` : ''}
                ${data.memo ? `
                    <div class="memo-section">
                        <div class="section-title">
                            <i class="fas fa-lightbulb"></i> 记忆妙招
                        </div>
                        <div class="memo-text">${data.memo}</div>
                    </div>
                ` : ''}
            </div>
        `;

        // 绑定事件
        this._bindCardEvents(card, data, moduleType, { onFavorite, onExpand, onSpeak });

        return card;
    },

    // 绑定卡片事件
    _bindCardEvents(card, data, moduleType, callbacks) {
        const { onFavorite, onExpand, onSpeak } = callbacks;

        // 发音事件 - 喇叭图标
        const audioContainer = card.querySelector('.audio-container');
        audioContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const wordInfo = card.querySelector('.word-info');
            const text = wordInfo.dataset.text;
            window.RiyuCommon.SpeechHelper.speak(text);
            if (onSpeak) onSpeak(data);
        });

        // 单词信息点击事件
        const wordInfo = card.querySelector('.word-info');
        wordInfo.addEventListener('click', (e) => {
            if (!e.target.closest('.expand-icon')) {
                card.classList.toggle('expanded');
                if (onExpand) onExpand(data, card.classList.contains('expanded'));
            }
        });

        // 例句发音事件
        card.querySelectorAll('.example-jp').forEach(el => {
            el.addEventListener('click', () => {
                let text = el.dataset.text;
                // 移除开头的序号部分（如"1. "）
                text = text.replace(/^\d+\.\s*/, '');
                window.RiyuCommon.SpeechHelper.speak(text);
            });
        });

        // 收藏事件
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isFav = window.RiyuCommon.ProgressManager.toggleFavorite(moduleType, data.id);
            favoriteBtn.classList.toggle('active', isFav);
            const icon = favoriteBtn.querySelector('i');
            icon.className = `fas ${isFav ? 'fa-heart' : 'fa-regular fa-heart'}`;
            if (onFavorite) onFavorite(data, isFav);
        });

        // 展开/收起事件
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn') &&
                !e.target.closest('.audio-container') &&
                !e.target.closest('.example-jp')) {
                card.classList.toggle('expanded');
                if (onExpand) onExpand(data, card.classList.contains('expanded'));
            }
        });
    },

    // 高亮卡片
    highlightCard(card, duration = 3000) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            card.classList.remove('highlighted');
        }, duration);
    }
};

// ==================== 筛选组件 ====================
const FilterComponent = {
    // 创建筛选按钮组
    createFilterGroup(options) {
        const { label, filters, activeFilter = 'all', onChange } = options;

        const container = document.createElement('div');
        container.className = 'filter-section';

        container.innerHTML = `
            <span class="filter-label">${label}：</span>
            <div class="filter-buttons"></div>
        `;

        const buttonsContainer = container.querySelector('.filter-buttons');

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = `filter-btn ${filter.value === activeFilter ? 'active' : ''}`;
            button.dataset.filter = filter.value;
            button.textContent = filter.label;

            button.addEventListener('click', () => {
                buttonsContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                if (onChange) onChange(filter.value);
            });

            buttonsContainer.appendChild(button);
        });

        return container;
    }
};

// ==================== 导出 ====================
if (typeof window !== 'undefined') {
    window.RiyuComponents = {
        CardComponent,
        FilterComponent
    };
}
