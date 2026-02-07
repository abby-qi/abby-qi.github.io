/**
 * 日语学习平台 - 主页面逻辑
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 初始化统计数据
    await updateStats();

    // 绑定快捷操作事件
    bindQuickActions();

    // 绑定仪表盘事件
    bindDashboardEvents();

    // 加载模块统计数据
    loadModuleStats();

    // 加载模块学习进度
    loadModuleProgress();

    // 加载模块内容（替换最近学习）
    loadModuleContent();

    // 加载学习计划
    loadStudyPlan();

    // 加载记忆曲线任务
    loadMemoryTasks();
});

// 加载模块内容（默认显示提示信息）
async function loadModuleContent() {
    const contentDisplay = document.getElementById('moduleContentDisplay');
    if (!contentDisplay) return;

    // 默认显示提示信息，让用户在侧边选择模块
    contentDisplay.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 20px;">📚</div>
            <h2 style="margin: 0 0 15px 0; color: #333;">请从左侧选择模块</h2>
            <p style="margin: 0; color: #666; max-width: 300px;">点击左侧快速访问中的模块，开始你的日语学习之旅</p>
        </div>
    `;
}

// 获取模块颜色
function getModuleColor(moduleType) {
    const colors = {
        'noun': '#667eea',
        'verb': '#ff6b6b',
        'adjective': '#4ecdc4',
        'adjectival-verb': '#45b7d1',
        'adverb': '#96ceb4',
        'pronoun': '#ffcc5c',
        'other-word': '#d9a7c7',
        'loanword': '#f093fb',
        'fixed-collocations': '#4facfe'
    };
    return colors[moduleType] || '#666';
}

// 更新统计数据
async function updateStats() {
    const recentCount = window.RiyuCommon.ProgressManager.getRecent().length;
    const favoriteCount = window.RiyuCommon.ProgressManager.getFavorites().length;

    // 计算总学习次数
    const studyStats = window.RiyuCommon.ProgressManager.getStudyStats();
    const totalStudyCount = Object.values(studyStats).reduce((sum, stat) => sum + (stat.count || 0), 0);

    // 计算总单词数和已学习单词数
    const totalWords = await calculateTotalWords();
    const studiedWords = calculateStudiedWords();

    // 计算学习天数和连续学习天数
    const studyDays = calculateStudyDays();
    const studyStreak = calculateStudyStreak();

    // 计算平均得分（模拟数据）
    const avgScore = Math.round(Math.random() * 20) + 80;

    // 添加数字增长动画
    animateNumber('recentCount', recentCount, 1000);
    animateNumber('favoriteCount', favoriteCount, 1200);
    animateNumber('studyCount', totalStudyCount, 1500);
    animateNumber('totalWords', totalWords, 800);
    animateNumber('studiedWords', studiedWords, 1000);
    animateNumber('studyDays', studyDays, 1200);
    animateNumber('studyStreak', studyStreak, 1400);
    animateNumber('avgScore', avgScore, 1600);

    console.log(`[Main] 统计更新: 最近=${recentCount}, 收藏=${favoriteCount}, 学习=${totalStudyCount}, 总单词=${totalWords}, 已学习=${studiedWords}`);
}

// 计算总单词数
async function calculateTotalWords() {
    try {
        // 从StatisticsManager获取实际的模块统计数据
        const stats = await window.RiyuCommon.StatisticsManager.loadAllStats();
        let total = 0;
        
        // 遍历所有模块，累加总单词数
        Object.values(stats).forEach(stat => {
            total += stat.total;
        });
        
        return total;
    } catch (error) {
        console.error('[Main] 计算总单词数失败:', error);
        // 如果加载失败，返回基于模块数量的估算值
        const modules = window.RiyuCommon.StatisticsManager.getModules();
        return modules.length * 100;
    }
}

// 计算已学习单词数
function calculateStudiedWords() {
    const studyStats = window.RiyuCommon.ProgressManager.getStudyStats();
    return Object.keys(studyStats).length;
}

// 计算学习天数
function calculateStudyDays() {
    const studyStats = window.RiyuCommon.ProgressManager.getStudyStats();
    const daysSet = new Set();
    
    Object.values(studyStats).forEach(stat => {
        if (stat.lastStudy) {
            const date = new Date(stat.lastStudy).toDateString();
            daysSet.add(date);
        }
    });
    
    return Math.max(daysSet.size, 0);
}

// 计算连续学习天数
function calculateStudyStreak() {
    const studyStats = window.RiyuCommon.ProgressManager.getStudyStats();
    const daysSet = new Set();
    
    Object.values(studyStats).forEach(stat => {
        if (stat.lastStudy) {
            const date = new Date(stat.lastStudy).toDateString();
            daysSet.add(date);
        }
    });
    
    // 计算连续天数（模拟数据）
    return Math.min(daysSet.size, 7);
}

// 数字增长动画
function animateNumber(elementId, targetValue, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentValue = 0;
    const increment = targetValue / (duration / 16);
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // 使用缓动函数使动画更自然
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        currentValue = Math.floor(easedProgress * targetValue);
        
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = targetValue;
        }
    }

    requestAnimationFrame(updateNumber);
}

// 绑定快捷操作事件
function bindQuickActions() {
    // 查看收藏
    document.getElementById('viewFavorites').addEventListener('click', () => {
        const favorites = window.RiyuCommon.ProgressManager.getFavorites();
        if (favorites.length === 0) {
            alert('还没有收藏任何单词哦~');
            return;
        }

        let message = '已收藏的单词：\n\n';
        favorites.forEach((item, index) => {
            const [moduleType, wordId] = item.split(':');
            message += `${index + 1}. ${getModuleName(moduleType)} - ID: ${wordId}\n`;
        });
        alert(message);
    });

    // 查看最近学习
    document.getElementById('viewRecent').addEventListener('click', () => {
        const recent = window.RiyuCommon.ProgressManager.getRecent();
        if (recent.length === 0) {
            alert('还没有学习记录哦~');
            return;
        }

        let message = '最近学习：\n\n';
        recent.forEach((item, index) => {
            const [moduleType, wordId] = item.split(':');
            message += `${index + 1}. ${getModuleName(moduleType)} - ID: ${wordId}\n`;
        });
        alert(message);
    });

    // 清空数据
    document.getElementById('clearData').addEventListener('click', () => {
        if (confirm('确定要清空所有学习数据吗？此操作不可恢复！')) {
            window.RiyuCommon.StorageHelper.clear();
            alert('数据已清空！');
            updateStats();
            loadModuleStats(); // 重新加载模块统计
            loadModuleProgress(); // 重新加载模块进度
            loadModuleContent(); // 重新加载模块内容
            loadStudyPlan(); // 重新加载学习计划
            loadMemoryTasks(); // 重新加载记忆任务
        }
    });

    // 绑定快速访问模块点击事件
    bindQuickAccessEvents();
}

// 绑定快速访问模块点击事件
function bindQuickAccessEvents() {
    const quickAccessItems = document.querySelectorAll('.module-item[data-module], .module-link[data-module]');
    quickAccessItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // 阻止默认行为
            const moduleType = item.getAttribute('data-module');
            if (moduleType) {
                loadModulePage(moduleType);
            }
        });
    });
}

// 加载模块页面到中间区域
function loadModulePage(moduleType) {
    const contentDisplay = document.getElementById('moduleContentDisplay');
    if (!contentDisplay) return;

    // 显示加载状态
    contentDisplay.innerHTML = `<p style="text-align: center; padding: 50px;">正在加载${getModuleName(moduleType)}模块页面...</p>`;

    // 获取模块页面路径
    const modulePath = getModulePath(moduleType);
    if (!modulePath) {
        contentDisplay.innerHTML = `<p style="text-align: center; padding: 50px; color: red;">未找到${getModuleName(moduleType)}模块页面</p>`;
        return;
    }

    // 立即创建并添加iframe，而不是等待onload事件
    const iframe = document.createElement('iframe');
    iframe.src = modulePath;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    iframe.style.display = 'block';

    // 设置超时处理，防止页面加载时间过长
    const loadTimeout = setTimeout(() => {
        contentDisplay.innerHTML = `<p style="text-align: center; padding: 50px; color: orange;">${getModuleName(moduleType)}模块页面加载中，请稍候...</p>`;
    }, 3000); // 3秒后显示加载中提示

    // 监听iframe加载完成
    iframe.onload = function() {
        clearTimeout(loadTimeout); // 清除超时处理
        // 确保iframe正确显示
        if (contentDisplay.contains(iframe)) {
            // iframe已在页面中，无需重新添加
        } else {
            contentDisplay.innerHTML = '';
            contentDisplay.appendChild(iframe);
        }
    };

    // 监听iframe加载错误
    iframe.onerror = function() {
        clearTimeout(loadTimeout); // 清除超时处理
        contentDisplay.innerHTML = `<p style="text-align: center; padding: 50px; color: red;">加载${getModuleName(moduleType)}模块页面失败</p>`;
    };

    // 立即添加iframe到页面
    contentDisplay.innerHTML = '';
    contentDisplay.appendChild(iframe);
}

// 获取模块页面路径
function getModulePath(moduleType) {
    const modulePaths = {
        'noun': 'modules/noun/index.html',
        'verb': 'modules/verb/index.html',
        'adjective': 'modules/adjective/index.html',
        'adjectival-verb': 'modules/adjectival-verb/index.html',
        'adverb': 'modules/adverb/index.html',
        'pronoun': 'modules/pronoun/index.html',
        'loanword': 'modules/loanword/index.html',
        'other-word': 'modules/other-word/index.html',
        'fixed-collocations': 'modules/fixed-collocations/index.html',
        'study-plan': 'pages/study-plan.html',
        'word-selector': 'pages/word-selector.html'
    };
    return modulePaths[moduleType] || null;
}

// 绑定仪表盘事件
function bindDashboardEvents() {
    // 刷新按钮事件
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            // 显示加载状态
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>刷新中...</span>';
            
            // 重新加载所有数据
            try {
                await updateStats();
                await loadModuleProgress();
                await loadModuleContent();
                loadStudyPlan();
                loadMemoryTasks();
            } catch (error) {
                console.error('[Main] 刷新数据失败:', error);
            } finally {
                // 恢复按钮状态
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>刷新</span>';
            }
        });
    }

    // 主题切换按钮事件
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // 检查本地存储中的主题偏好
        const savedTheme = localStorage.getItem('riyu-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>浅色模式</span>';
        }

        themeToggle.addEventListener('click', () => {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            
            if (isDarkMode) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>浅色模式</span>';
                localStorage.setItem('riyu-theme', 'dark');
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>深色模式</span>';
                localStorage.setItem('riyu-theme', 'light');
            }
        });
    }

    // 生成记忆曲线任务按钮事件
    const generateMemoryTasksBtn = document.getElementById('generateMemoryTasksBtn');
    if (generateMemoryTasksBtn) {
        generateMemoryTasksBtn.addEventListener('click', generateMemoryTasks);
    }
}

// 加载模块统计数据
async function loadModuleStats() {
    // 此函数现在用于旧的仪表盘，新的仪表盘使用loadModuleProgress
}

// 加载模块学习进度
async function loadModuleProgress() {
    const progressList = document.getElementById('moduleProgressList');
    if (!progressList) return;

    progressList.innerHTML = '<p>正在加载模块进度...</p>';

    try {
        const stats = await window.RiyuCommon.StatisticsManager.loadAllStats();
        renderModuleProgress(stats);
    } catch (error) {
        console.error('[Main] 加载模块进度失败:', error);
        progressList.innerHTML = '<p class="error">加载模块进度失败，请刷新页面重试</p>';
    }
}

// 渲染模块学习进度
function renderModuleProgress(stats) {
    const progressList = document.getElementById('moduleProgressList');
    if (!progressList) return;

    let html = '';

    Object.entries(stats).forEach(([moduleType, stat]) => {
        const progress = stat.total > 0 ? Math.round((stat.studied / stat.total) * 100) : 0;
        const icon = getModuleIcon(moduleType);

        html += `
            <div class="module-progress-item">
                <div class="module-progress-header">
                    <div class="module-progress-title">
                        <span>${icon}</span> ${stat.name}
                    </div>
                    <div class="module-progress-percentage">${progress}%</div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-bottom: 4px;">
                    <span>已学习: ${stat.studied}</span>
                    <span>总单词: ${stat.total}</span>
                </div>
                <div class="module-progress-bar">
                    <div class="module-progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    });

    progressList.innerHTML = html;
}

// 加载最近学习单词
function loadRecentWords() {
    const recentWordsList = document.getElementById('recentWordsList');
    if (!recentWordsList) return;

    const recent = window.RiyuCommon.ProgressManager.getRecent();
    
    if (recent.length === 0) {
        recentWordsList.innerHTML = '<p>还没有学习记录哦~</p>';
        return;
    }

    let html = '';
    
    // 只显示最近5个
    const recentWords = recent.slice(0, 5);
    
    recentWords.forEach(item => {
        const [moduleType, wordId] = item.split(':');
        const moduleName = getModuleName(moduleType);
        
        // 这里使用模拟数据，实际应该从模块数据中获取单词详情
        const wordText = `${moduleName}单词${wordId}`;
        const wordMeaning = `这是${moduleName}的第${wordId}个单词`;
        
        html += `
            <div class="recent-word-item">
                <div class="recent-word-info">
                    <div class="recent-word-text">${wordText}</div>
                    <div class="recent-word-meaning">${wordMeaning}</div>
                </div>
                <div class="recent-word-module">${moduleName}</div>
            </div>
        `;
    });

    recentWordsList.innerHTML = html;
}

// 加载学习计划
function loadStudyPlan() {
    const currentPlanName = document.getElementById('currentPlanName');
    const planStartDate = document.getElementById('planStartDate');
    const planEndDate = document.getElementById('planEndDate');
    const planRemainingDays = document.getElementById('planRemainingDays');
    const planProgressFill = document.getElementById('planProgressFill');
    const planProgressText = document.getElementById('planProgressText');
    
    if (!currentPlanName || !planStartDate || !planEndDate || !planRemainingDays || !planProgressFill || !planProgressText) {
        return;
    }

    // 获取当前活跃的学习计划
    const activePlan = window.RiyuCommon.TaskManager.getActiveStudyPlan();
    
    if (!activePlan) {
        currentPlanName.textContent = '未设置';
        planStartDate.textContent = '-';
        planEndDate.textContent = '-';
        planRemainingDays.textContent = '0';
        planProgressFill.style.width = '0%';
        planProgressText.textContent = '0%';
        return;
    }

    // 显示计划信息
    currentPlanName.textContent = activePlan.name;
    planStartDate.textContent = formatDate(activePlan.startDate);
    planEndDate.textContent = formatDate(activePlan.endDate);
    
    // 计算剩余天数
    const today = new Date();
    const endDate = new Date(activePlan.endDate);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    planRemainingDays.textContent = remainingDays;
    
    // 计算进度
    const totalDays = activePlan.totalDays;
    const completedDays = totalDays - remainingDays;
    const progress = Math.min(100, Math.round((completedDays / totalDays) * 100));
    planProgressFill.style.width = `${progress}%`;
    planProgressText.textContent = `${progress}%`;
}

// 加载记忆曲线任务
function loadMemoryTasks() {
    const memoryTasksList = document.getElementById('memoryTasksList');
    if (!memoryTasksList) return;

    // 获取今日任务
    const tasks = window.RiyuCommon.TaskManager.getTodayTasks();
    
    if (tasks.length === 0) {
        memoryTasksList.innerHTML = '<p>今天还没有任务，点击生成任务按钮创建</p>';
        return;
    }

    // 渲染最新的今日任务
    const latestTask = tasks[tasks.length - 1];
    if (latestTask && (latestTask.review || latestTask.new)) {
        renderMemoryTasks(latestTask);
    }
}

// 生成记忆曲线任务
async function generateMemoryTasks() {
    const memoryTasksList = document.getElementById('memoryTasksList');
    const generateBtn = document.getElementById('generateMemoryTasksBtn');
    
    if (!memoryTasksList || !generateBtn) return;
    
    // 显示加载状态
    generateBtn.textContent = '生成中...';
    generateBtn.classList.add('loading');
    memoryTasksList.innerHTML = '<p>正在生成记忆曲线任务...</p>';

    try {
        // 生成基于记忆曲线的任务
        const tasks = await window.RiyuCommon.SpacedRepetitionManager.generateDailyTasks({
            newGoal: 10,
            reviewGoal: 20
        });

        // 渲染生成的任务
        renderMemoryTasks(tasks);

        // 保存任务
        window.RiyuCommon.TaskManager.saveDailyTask(tasks);
    } catch (error) {
        console.error('[Main] 生成记忆任务失败:', error);
        memoryTasksList.innerHTML = '<p class="error">生成任务失败，请刷新页面重试</p>';
    } finally {
        // 恢复按钮状态
        generateBtn.textContent = '生成任务';
        generateBtn.classList.remove('loading');
    }
}

// 渲染记忆曲线任务
function renderMemoryTasks(tasks) {
    const memoryTasksList = document.getElementById('memoryTasksList');
    if (!memoryTasksList) return;
    
    if (tasks.total === 0) {
        memoryTasksList.innerHTML = '<p>今天没有需要学习的任务，明天再来吧！</p>';
        return;
    }

    let html = '';

    // 复习任务
    if (tasks.review && tasks.review.length > 0) {
        tasks.review.forEach((task, index) => {
            html += `
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-description">复习 ${getModuleName(task.moduleType)}</div>
                        <div class="task-details">上次学习: ${formatDate(task.lastStudy)}</div>
                    </div>
                    <button class="task-action" onclick="studyTask('${task.moduleType}')">开始学习</button>
                </div>
            `;
        });
    }

    // 新学习任务
    if (tasks.new && tasks.new.length > 0) {
        tasks.new.forEach((task, index) => {
            html += `
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-description">学习 ${getModuleName(task.moduleType)} 新单词</div>
                        <div class="task-details">${task.count || 10} 个单词</div>
                    </div>
                    <button class="task-action" onclick="studyTask('${task.moduleType}')">开始学习</button>
                </div>
            `;
        });
    }

    memoryTasksList.innerHTML = html;
}

// 开始学习任务
function studyTask(moduleType) {
    const modulePaths = {
        'noun': 'modules/noun/index.html',
        'verb': 'modules/verb/index.html',
        'adjective': 'modules/adjective/index.html',
        'adjectival-verb': 'modules/adjectival-verb/index.html',
        'adverb': 'modules/adverb/index.html',
        'pronoun': 'modules/pronoun/index.html',
        'other-word': 'modules/other-word/index.html',
        'loanword': 'modules/loanword/index.html',
        'fixed-collocations': 'modules/fixed-collocations/index.html'
    };

    const path = modulePaths[moduleType];
    if (path) {
        window.location.href = path;
    }
}

// 获取模块图标
function getModuleIcon(moduleType) {
    const icons = {
        'noun': '📖',
        'verb': '⚡',
        'adjective': '🌟',
        'adjectival-verb': '🎯',
        'adverb': '💫',
        'pronoun': '👤',
        'other-word': '🔧',
        'loanword': '🌏',
        'fixed-collocations': '🔗',
        'study-plan': '📅',
        'word-selector': '📋'
    };
    return icons[moduleType] || '📚';
}

// 获取模块名称
function getModuleName(moduleType) {
    const moduleNames = {
        'noun': '名词',
        'verb': '动词',
        'adjective': '形容词',
        'adjectival-verb': '形容动词',
        'adverb': '副词',
        'pronoun': '代词',
        'other-word': '其他词',
        'loanword': '外来语',
        'fixed-collocations': '固定搭配',
        'study-plan': '学习计划',
        'word-selector': '单词选择'
    };
    return moduleNames[moduleType] || moduleType;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 完成任务
function completeTask(taskId) {
    const success = window.RiyuCommon.TaskManager.completeTask(taskId);
    if (success) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('completed');
            const actionBtn = taskElement.querySelector('.task-action');
            if (actionBtn) {
                actionBtn.textContent = '已完成';
                actionBtn.disabled = true;
            }
        }
    }
}
