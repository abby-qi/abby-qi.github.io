/**
 * 日语学习平台 - 通用功能库
 * 提供跨模块共享的工具函数和组件
 */

// ==================== 语音合成 ====================
const SpeechHelper = {
    voicesLoaded: false,
    availableVoices: [],

    // 初始化语音合成
    init() {
        if (!this.voicesLoaded) {
            this.availableVoices = window.speechSynthesis.getVoices();
            this.voicesLoaded = true;
            console.log('[SpeechHelper] 语音列表加载完成，可用语音数量:', this.availableVoices.length);
        }
    },

    // 播放日语语音
    speak(text) {
        try {
            const utterance = new SpeechSynthesisUtterance();
            utterance.text = text;
            utterance.lang = 'ja-JP';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            // 选择日语语音
            let selectedVoice = this.availableVoices.find(voice => voice.lang === 'ja-JP');

            if (!selectedVoice) {
                selectedVoice = this.availableVoices.find(voice =>
                    voice.name.toLowerCase().includes('japanese') ||
                    voice.name.includes('日本')
                );
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('[SpeechHelper] 语音合成失败:', error);
        }
    }
};

// 监听语音列表变化
window.speechSynthesis.onvoiceschanged = () => SpeechHelper.init();

// ==================== 存储管理 ====================
const StorageHelper = {
    PREFIX: 'riyu_',

    // 获取存储键
    getKey(key) {
        return this.PREFIX + key;
    },

    // 保存数据到 localStorage
    set(key, value) {
        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('[StorageHelper] 保存失败:', error);
            return false;
        }
    },

    // 从 localStorage 读取数据
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.getKey(key));
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('[StorageHelper] 读取失败:', error);
            return defaultValue;
        }
    },

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error('[StorageHelper] 删除失败:', error);
            return false;
        }
    },

    // 清空所有数据
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('[StorageHelper] 清空失败:', error);
            return false;
        }
    }
};

// ==================== 学习进度管理 ====================
const ProgressManager = {
    // 添加到最近学习
    addToRecent(moduleType, wordId) {
        const recent = StorageHelper.get('recent', []);
        const key = `${moduleType}:${wordId}`;

        // 移除已存在的
        const index = recent.indexOf(key);
        if (index > -1) {
            recent.splice(index, 1);
        }

        // 添加到开头
        recent.unshift(key);

        // 限制最多保存50个
        if (recent.length > 50) {
            recent.pop();
        }

        StorageHelper.set('recent', recent);
    },

    // 获取最近学习记录
    getRecent() {
        return StorageHelper.get('recent', []);
    },

    // 切换收藏状态
    toggleFavorite(moduleType, wordId) {
        const favorites = StorageHelper.get('favorites', []);
        const key = `${moduleType}:${wordId}`;
        const index = favorites.indexOf(key);

        if (index > -1) {
            favorites.splice(index, 1);
            StorageHelper.set('favorites', favorites);
            return false; // 已取消收藏
        } else {
            favorites.push(key);
            StorageHelper.set('favorites', favorites);
            return true; // 已添加收藏
        }
    },

    // 检查是否已收藏
    isFavorite(moduleType, wordId) {
        const favorites = StorageHelper.get('favorites', []);
        const key = `${moduleType}:${wordId}`;
        return favorites.includes(key);
    },

    // 获取所有收藏
    getFavorites() {
        return StorageHelper.get('favorites', []);
    },

    // 记录学习次数
    recordStudy(moduleType, wordId) {
        const studyStats = StorageHelper.get('study_stats', {});
        const key = `${moduleType}:${wordId}`;

        if (!studyStats[key]) {
            studyStats[key] = { count: 0, lastStudy: null };
        }

        studyStats[key].count++;
        studyStats[key].lastStudy = new Date().toISOString();

        StorageHelper.set('study_stats', studyStats);
    },

    // 获取学习统计
    getStudyStats() {
        return StorageHelper.get('study_stats', {});
    },

    // 获取单词学习次数
    getStudyCount(moduleType, wordId) {
        const stats = this.getStudyStats();
        const key = `${moduleType}:${wordId}`;
        return stats[key]?.count || 0;
    }
};

// ==================== 数据加载器 ====================
const DataLoader = {
    // 异步加载 JSON 数据
    async loadJson(path) {
        try {
            // 检测是否使用 file:// 协议
            const isFileProtocol = window.location.protocol === 'file:';
            
            if (isFileProtocol) {
                // 使用 XMLHttpRequest 加载本地文件
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', path, true);
                    xhr.overrideMimeType('application/json');
                    
                    xhr.onload = function() {
                        if (xhr.status === 200 || xhr.status === 0) { // 0 表示本地文件加载成功
                            try {
                                const data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (parseError) {
                                reject(new Error('JSON 解析失败: ' + parseError.message));
                            }
                        } else {
                            // 尝试从上级目录加载
                            const xhr2 = new XMLHttpRequest();
                            xhr2.open('GET', '../' + path, true);
                            xhr2.overrideMimeType('application/json');
                            
                            xhr2.onload = function() {
                                if (xhr2.status === 200 || xhr2.status === 0) {
                                    try {
                                        const data = JSON.parse(xhr2.responseText);
                                        resolve(data);
                                    } catch (parseError) {
                                        reject(new Error('JSON 解析失败: ' + parseError.message));
                                    }
                                } else {
                                    // 尝试从更上级目录加载
                                    const xhr3 = new XMLHttpRequest();
                                    xhr3.open('GET', '../../' + path, true);
                                    xhr3.overrideMimeType('application/json');
                                    
                                    xhr3.onload = function() {
                                        if (xhr3.status === 200 || xhr3.status === 0) {
                                            try {
                                                const data = JSON.parse(xhr3.responseText);
                                                resolve(data);
                                            } catch (parseError) {
                                                reject(new Error('JSON 解析失败: ' + parseError.message));
                                            }
                                        } else {
                                            reject(new Error(`本地文件加载失败: ${path}`));
                                        }
                                    };
                                    
                                    xhr3.onerror = function() {
                                        reject(new Error(`本地文件加载失败: ${path}`));
                                    };
                                    
                                    xhr3.send();
                                }
                            };
                            
                            xhr2.onerror = function() {
                                reject(new Error(`本地文件加载失败: ${path}`));
                            };
                            
                            xhr2.send();
                        }
                    };
                    
                    xhr.onerror = function() {
                        reject(new Error(`本地文件加载失败: ${path}`));
                    };
                    
                    xhr.send();
                });
            } else {
                // 使用 fetch API 加载远程文件
                // 尝试从当前目录加载
                let response = await fetch(path);
                
                // 如果失败，尝试从上级目录加载
                if (!response.ok) {
                    response = await fetch('../' + path);
                }
                
                // 如果仍然失败，尝试从更上级目录加载
                if (!response.ok) {
                    response = await fetch('../../' + path);
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            }
        } catch (error) {
            console.error('[DataLoader] 加载失败:', path, error);
            throw error;
        }
    },

    // 批量加载数据
    async loadMultiple(paths) {
        const promises = paths.map(path => this.loadJson(path));
        return Promise.allSettled(promises);
    }
};

// ==================== 统计管理 ====================
const StatisticsManager = {
    // 模块配置
    modules: [
        { type: 'noun', name: '名词', path: 'modules/noun/data/noun.json' },
        { type: 'verb', name: '动词', path: 'modules/verb/data/verb.json' },
        { type: 'adjective', name: '形容词', path: 'modules/adjective/data/adjective.json' },
        { type: 'adjectival-verb', name: '形容动词', path: 'modules/adjectival-verb/data/adjectival-verb.json' },
        { type: 'adverb', name: '副词', path: 'modules/adverb/data/adverb.json' },
        { type: 'pronoun', name: '代词', path: 'modules/pronoun/data/pronoun.json' },
        { type: 'loanword', name: '外来语', path: 'modules/loanword/data/loanword.json' },
        { type: 'other-word', name: '其他词', path: 'modules/other-word/data/other-word.json' },
        { type: 'fixed-collocations', name: '固定搭配', path: 'modules/fixed-collocations/data/fixed-collocations.json' }
    ],
    
    // 统计数据缓存
    statsCache: null,
    
    // 加载所有模块的统计数据
    async loadAllStats() {
        if (this.statsCache) {
            return this.statsCache;
        }
        
        const stats = {};
        
        for (const module of this.modules) {
            try {
                const data = await DataLoader.loadJson(module.path);
                stats[module.type] = {
                    name: module.name,
                    total: data.length,
                    studied: this.getStudiedCount(module.type),
                    favorite: this.getFavoriteCount(module.type),
                    path: module.path
                };
            } catch (error) {
                console.error(`[StatisticsManager] 加载${module.name}数据失败:`, error);
                // 使用默认值，确保即使数据加载失败也能正常工作
                stats[module.type] = {
                    name: module.name,
                    total: 100, // 默认每个模块有100个单词
                    studied: 0,
                    favorite: 0,
                    path: module.path
                };
            }
        }
        
        this.statsCache = stats;
        return stats;
    },
    
    // 获取模块列表
    getModules() {
        return this.modules;
    },
    
    // 获取已学习数量
    getStudiedCount(moduleType) {
        const studyStats = ProgressManager.getStudyStats();
        const moduleStats = Object.keys(studyStats).filter(key => key.startsWith(`${moduleType}:`));
        return moduleStats.length;
    },
    
    // 获取收藏数量
    getFavoriteCount(moduleType) {
        const favorites = ProgressManager.getFavorites();
        const moduleFavorites = favorites.filter(key => key.startsWith(`${moduleType}:`));
        return moduleFavorites.length;
    },
    
    // 清空缓存
    clearCache() {
        this.statsCache = null;
    }
};

// ==================== 记忆曲线管理 ====================
const SpacedRepetitionManager = {
    // 记忆曲线间隔 (天)
    intervals: [1, 2, 4, 7, 15, 30],
    
    // 学习计划缓存
    studyPlanCache: null,
    
    // 基于记忆曲线生成复习任务
    generateReviewTasks() {
        const studyStats = ProgressManager.getStudyStats();
        const today = new Date();
        const reviewTasks = [];
        
        // 计算需要复习的单词
        Object.entries(studyStats).forEach(([key, stats]) => {
            if (!stats.lastStudy) return;
            
            const lastStudy = new Date(stats.lastStudy);
            const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
            
            // 检查是否在复习间隔上
            if (this.intervals.includes(daysDiff)) {
                const [moduleType, wordId] = key.split(':');
                reviewTasks.push({
                    moduleType,
                    wordId: parseInt(wordId),
                    lastStudy: stats.lastStudy,
                    studyCount: stats.count,
                    dueDays: daysDiff
                });
            }
        });
        
        return reviewTasks;
    },
    
    // 生成新学习任务
    async generateNewTasks(dailyGoal = 20) {
        const tasks = [];
        const studyStats = ProgressManager.getStudyStats();
        const statsManager = StatisticsManager;
        
        try {
            // 获取所有模块的统计数据
            const moduleStats = await statsManager.loadAllStats();
            const modules = statsManager.getModules();
            
            // 计算每个模块需要学习的新单词数量
            const totalWords = Object.values(moduleStats).reduce((sum, stat) => sum + stat.total, 0);
            const totalStudied = Object.values(moduleStats).reduce((sum, stat) => sum + stat.studied, 0);
            const totalNew = totalWords - totalStudied;
            
            if (totalNew <= 0) {
                return tasks;
            }
            
            // 按比例分配每日学习目标
            for (const module of modules) {
                const moduleType = module.type;
                const stat = moduleStats[moduleType];
                
                if (!stat || stat.total <= 0) {
                    continue;
                }
                
                // 计算该模块的已学习数量
                const studiedCount = stat.studied;
                const newCount = stat.total - studiedCount;
                
                if (newCount <= 0) {
                    continue;
                }
                
                // 按比例分配学习任务
                const moduleGoal = Math.round((newCount / totalNew) * dailyGoal);
                
                if (moduleGoal > 0) {
                    tasks.push({
                        moduleType: moduleType,
                        count: moduleGoal,
                        type: 'new',
                        timestamp: new Date().toISOString()
                    });
                }
            }
            
            // 调整任务数量，确保不超过每日目标
            let totalAssigned = tasks.reduce((sum, task) => sum + task.count, 0);
            if (totalAssigned > dailyGoal) {
                // 从任务数量最多的模块开始减少
                tasks.sort((a, b) => b.count - a.count);
                while (totalAssigned > dailyGoal && tasks.length > 0) {
                    const task = tasks[0];
                    if (task.count > 1) {
                        task.count--;
                        totalAssigned--;
                    } else {
                        tasks.shift();
                        totalAssigned--;
                    }
                }
            }
            
        } catch (error) {
            console.error('[SpacedRepetitionManager] 生成新任务失败:', error);
        }
        
        return tasks;
    },
    
    // 生成每日综合任务
    async generateDailyTasks(options = {}) {
        const { newGoal = 10, reviewGoal = 20 } = options;
        
        const reviewTasks = this.generateReviewTasks().slice(0, reviewGoal);
        const newTasks = await this.generateNewTasks(newGoal);
        
        return {
            review: reviewTasks,
            new: newTasks,
            total: reviewTasks.length + newTasks.length
        };
    },
    
    // 生成学习计划
    async generateStudyPlan(options = {}) {
        const { 
            planType = 'days', // 'days' 或 'dailyWords'
            totalDays = 30, 
            dailyNewWords = 20,
            reviewRatio = 1,
            modules = [] // 要包含的模块
        } = options;
        
        const statsManager = StatisticsManager;
        const today = new Date();
        
        try {
            // 获取所有模块的统计数据
            const allModuleStats = await statsManager.loadAllStats();
            
            // 筛选选中的模块
            const selectedModules = modules.length > 0 
                ? statsManager.getModules().filter(m => modules.includes(m.type))
                : statsManager.getModules();
            
            // 计算总单词数
            let totalWords = 0;
            const moduleData = [];
            
            for (const module of selectedModules) {
                const stats = allModuleStats[module.type];
                if (stats && stats.total > 0) {
                    totalWords += stats.total;
                    moduleData.push({
                        type: module.type,
                        name: module.name,
                        totalWords: stats.total,
                        completedWords: stats.studied,
                        words: [] // 后续加载
                    });
                }
            }
            
            // 计算每天的新单词数量和总天数
            let actualTotalDays = planType === 'days' ? totalDays : Math.ceil(totalWords / dailyNewWords);
            let actualDailyNewWords = planType === 'days' ? Math.ceil(totalWords / actualTotalDays) : dailyNewWords;
            
            // 加载每个模块的单词数据
            for (let i = 0; i < moduleData.length; i++) {
                const module = moduleData[i];
                try {
                    const words = await DataLoader.loadJson(`modules/${module.type}/data/${module.type}.json`);
                    module.words = words;
                } catch (error) {
                    console.error(`[SpacedRepetitionManager] 加载模块 ${module.name} 数据失败:`, error);
                    module.words = [];
                }
            }
            
            // 生成每天的任务
            const planDays = [];
            const learnedWords = new Map(); // 已学习的单词，用于生成复习任务
            
            // 为每个模块生成默认单词数据
            for (const module of moduleData) {
                if (module.words.length === 0) {
                    // 生成默认单词数据
                    module.words = [];
                    for (let i = 1; i <= module.totalWords; i++) {
                        module.words.push({
                            id: i,
                            word: `${module.name}${i}`,
                            kana: `かな${i}`,
                            meaning: `${module.name}单词${i}的意思`
                        });
                    }
                }
            }
            
            for (let day = 1; day <= actualTotalDays; day++) {
                const date = new Date();
                date.setDate(today.getDate() + day - 1);
                
                // 计算每天的新单词
                const dayNewWords = this.calculateDailyNewWords(moduleData, actualDailyNewWords, day, learnedWords);
                
                // 计算每天的复习单词
                const dayReviewWords = this.calculateDailyReviewWords(learnedWords, day, reviewRatio);
                
                // 添加到计划中
                planDays.push({
                    day: day,
                    date: date.toISOString(),
                    newWords: dayNewWords,
                    reviewWords: dayReviewWords,
                    totalWords: dayNewWords.length + dayReviewWords.length,
                    completed: false,
                    completionRate: 0
                });
            }
            
            // 生成学习计划
            const studyPlan = {
                id: Utils.generateId(),
                name: '日语单词学习计划',
                startDate: today.toISOString(),
                endDate: new Date(today.getTime() + (actualTotalDays - 1) * 24 * 60 * 60 * 1000).toISOString(),
                totalDays: actualTotalDays,
                dailyNewWords: actualDailyNewWords,
                reviewRatio: reviewRatio,
                totalWords: totalWords,
                modules: moduleData,
                days: planDays,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.studyPlanCache = studyPlan;
            return studyPlan;
            
        } catch (error) {
            console.error('[SpacedRepetitionManager] 生成学习计划失败:', error);
            throw error;
        }
    },
    
    // 计算每天的新单词
    calculateDailyNewWords(modules, dailyNewWords, day, learnedWords) {
        const newWords = [];
        let wordsAdded = 0;
        
        // 遍历所有模块，按比例分配新单词
        for (const module of modules) {
            if (wordsAdded >= dailyNewWords) break;
            
            // 计算该模块每天应分配的单词数
            const moduleRatio = module.totalWords / modules.reduce((sum, m) => sum + m.totalWords, 0);
            const moduleDailyWords = Math.ceil(moduleRatio * dailyNewWords);
            
            // 选择未学习的单词
            let moduleWordsAdded = 0;
            for (const word of module.words) {
                if (wordsAdded >= dailyNewWords || moduleWordsAdded >= moduleDailyWords) break;
                
                const wordKey = `${module.type}:${word.id || word.word}`;
                if (!learnedWords.has(wordKey)) {
                    newWords.push({
                        moduleType: module.type,
                        moduleName: module.name,
                        ...word
                    });
                    
                    // 记录为已学习
                    learnedWords.set(wordKey, {
                        word: word,
                        moduleType: module.type,
                        firstStudy: day
                    });
                    
                    wordsAdded++;
                    moduleWordsAdded++;
                }
            }
        }
        
        return newWords;
    },
    
    // 计算每天的复习单词
    calculateDailyReviewWords(learnedWords, currentDay, reviewRatio) {
        const reviewWords = [];
        const reviewCount = Math.ceil(reviewRatio * 20); // 基于默认每天20个新单词计算复习数量
        
        // 遍历已学习的单词，检查是否需要复习
        for (const [key, data] of learnedWords.entries()) {
            if (reviewWords.length >= reviewCount) break;
            
            const daysSinceFirstStudy = currentDay - data.firstStudy;
            
            // 检查是否在复习间隔上
            if (this.intervals.includes(daysSinceFirstStudy)) {
                reviewWords.push({
                    moduleType: data.moduleType,
                    ...data.word
                });
            }
        }
        
        return reviewWords;
    },
    
    // 获取学习计划
    getStudyPlan() {
        return this.studyPlanCache;
    },
    
    // 清空学习计划缓存
    clearStudyPlanCache() {
        this.studyPlanCache = null;
    }
};

// ==================== 任务管理 ====================
const TaskManager = {
    // 保存每日任务
    saveDailyTask(task) {
        const tasks = this.getAllTasks();
        tasks.push({
            id: Utils.generateId(),
            ...task,
            createdAt: new Date().toISOString()
        });
        StorageHelper.set('daily_tasks', tasks);
    },
    
    // 获取所有任务
    getAllTasks() {
        return StorageHelper.get('daily_tasks', []);
    },
    
    // 获取今日任务
    getTodayTasks() {
        const tasks = this.getAllTasks();
        const today = new Date().toDateString();
        
        return tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            return taskDate === today;
        });
    },
    
    // 完成任务
    completeTask(taskId) {
        const tasks = this.getAllTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex > -1) {
            tasks[taskIndex].completed = true;
            tasks[taskIndex].completedAt = new Date().toISOString();
            StorageHelper.set('daily_tasks', tasks);
            return true;
        }
        
        return false;
    },
    
    // 清空过期任务（保留最近30天）
    cleanupOldTasks() {
        const tasks = this.getAllTasks();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentTasks = tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= thirtyDaysAgo;
        });
        
        StorageHelper.set('daily_tasks', recentTasks);
    },
    
    // 保存学习计划
    saveStudyPlan(plan) {
        const plans = this.getAllStudyPlans();
        
        // 检查是否已存在
        const existingIndex = plans.findIndex(p => p.id === plan.id);
        
        if (existingIndex > -1) {
            // 更新现有计划
            plans[existingIndex] = {
                ...plan,
                updatedAt: new Date().toISOString()
            };
        } else {
            // 添加新计划
            plans.push({
                ...plan,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        
        StorageHelper.set('study_plans', plans);
        return true;
    },
    
    // 获取所有学习计划
    getAllStudyPlans() {
        return StorageHelper.get('study_plans', []);
    },
    
    // 获取指定学习计划
    getStudyPlan(planId) {
        const plans = this.getAllStudyPlans();
        return plans.find(p => p.id === planId) || null;
    },
    
    // 获取当前活跃的学习计划
    getActiveStudyPlan() {
        const plans = this.getAllStudyPlans();
        return plans.find(p => p.status === 'active') || null;
    },
    
    // 更新计划状态
    updatePlanStatus(planId, status) {
        const plans = this.getAllStudyPlans();
        const planIndex = plans.findIndex(p => p.id === planId);
        
        if (planIndex > -1) {
            plans[planIndex].status = status;
            plans[planIndex].updatedAt = new Date().toISOString();
            StorageHelper.set('study_plans', plans);
            return true;
        }
        
        return false;
    },
    
    // 更新计划进度
    updatePlanProgress(planId, day, completed, completionRate) {
        const plans = this.getAllStudyPlans();
        const planIndex = plans.findIndex(p => p.id === planId);
        
        if (planIndex > -1) {
            const plan = plans[planIndex];
            const dayIndex = plan.days.findIndex(d => d.day === day);
            
            if (dayIndex > -1) {
                plan.days[dayIndex].completed = completed;
                plan.days[dayIndex].completionRate = completionRate;
                plan.updatedAt = new Date().toISOString();
                StorageHelper.set('study_plans', plans);
                return true;
            }
        }
        
        return false;
    },
    
    // 删除学习计划
    deleteStudyPlan(planId) {
        const plans = this.getAllStudyPlans();
        const filteredPlans = plans.filter(p => p.id !== planId);
        StorageHelper.set('study_plans', filteredPlans);
        return true;
    }
};

// ==================== 工具函数 ====================
const Utils = {
    // 防抖
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 深度克隆
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // 格式化日期
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // 随机打乱数组
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};

// ==================== 深色模式管理 ====================
const ThemeManager = {
    // 初始化主题
    init() {
        const savedTheme = localStorage.getItem('riyu-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    },
    
    // 切换主题
    toggle() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('riyu-theme', isDarkMode ? 'dark' : 'light');
        return isDarkMode;
    },
    
    // 获取当前主题
    getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    }
};

// 初始化深色模式
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// ==================== 导出 ====================
if (typeof window !== 'undefined') {
    window.RiyuCommon = {
        SpeechHelper,
        StorageHelper,
        ProgressManager,
        DataLoader,
        Utils,
        StatisticsManager,
        SpacedRepetitionManager,
        TaskManager,
        ThemeManager
    };
}
