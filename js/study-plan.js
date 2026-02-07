/**
 * 日语单词学习 - 学习计划页面逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面
    initPage();
    
    // 绑定事件
    bindEvents();
});

// 初始化页面
async function initPage() {
    // 生成模块选择选项
    await generateModuleSelection();
    
    // 设置默认计划类型
    setPlanType('days');
}

// 生成模块选择选项
async function generateModuleSelection() {
    const moduleSelection = document.getElementById('moduleSelection');
    const statsManager = window.RiyuCommon.StatisticsManager;
    
    try {
        // 获取所有模块的统计数据
        const moduleStats = await statsManager.loadAllStats();
        const modules = statsManager.getModules();
        
        // 生成模块选项
        let html = '';
        for (const module of modules) {
            const stats = moduleStats[module.type];
            if (stats && stats.total > 0) {
                html += `
                    <div class="module-option">
                        <input type="checkbox" id="module_${module.type}" name="modules" value="${module.type}" checked>
                        <label for="module_${module.type}">${module.name} (${stats.total} 个单词)</label>
                    </div>
                `;
            }
        }
        
        moduleSelection.innerHTML = html;
    } catch (error) {
        console.error('[StudyPlan] 生成模块选择失败:', error);
        moduleSelection.innerHTML = '<p>加载模块数据失败，请刷新页面重试</p>';
    }
}





// 生成学习计划
async function generatePlan() {
    const generateBtn = document.getElementById('generatePlanBtn');
    const resultDiv = document.getElementById('studyPlanResult');
    
    // 禁用按钮，防止重复点击
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    
    try {
        // 获取表单数据
        const formData = getFormData();
        
        // 生成学习计划
        const srm = window.RiyuCommon.SpacedRepetitionManager;
        const studyPlan = await srm.generateStudyPlan(formData);
        
        // 显示学习计划
        displayStudyPlan(studyPlan);
        
        // 保存到全局变量，供后续使用
        window.currentStudyPlan = studyPlan;
        
        // 显示结果区域
        resultDiv.classList.add('show');
        
        // 滚动到结果区域
        resultDiv.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('[StudyPlan] 生成计划失败:', error);
        alert('生成学习计划失败，请刷新页面重试');
    } finally {
        // 恢复按钮状态
        generateBtn.disabled = false;
        generateBtn.textContent = '生成学习计划';
    }
}

// 获取表单数据
function getFormData() {
    const planType = document.querySelector('input[name="planType"]:checked').value;
    const totalDays = parseInt(document.getElementById('totalDays').value) || 30;
    const dailyNewWords = parseInt(document.getElementById('dailyNewWords').value) || 20;
    const reviewRatio = parseFloat(document.getElementById('reviewRatio').value) || 1;
    
    // 获取选中的模块
    const selectedModules = [];
    const moduleCheckboxes = document.querySelectorAll('input[name="modules"]:checked');
    moduleCheckboxes.forEach(checkbox => {
        selectedModules.push(checkbox.value);
    });
    
    return {
        planType,
        totalDays,
        dailyNewWords,
        reviewRatio,
        modules: selectedModules
    };
}

// 显示学习计划
function displayStudyPlan(plan) {
    // 更新计划信息
    document.getElementById('planName').textContent = plan.name;
    document.getElementById('planTotalDays').textContent = plan.totalDays;
    document.getElementById('planDailyNewWords').textContent = plan.dailyNewWords;
    document.getElementById('planStartDate').textContent = formatDate(plan.startDate);
    document.getElementById('planEndDate').textContent = formatDate(plan.endDate);
    document.getElementById('planTotalWords').textContent = plan.totalWords;
    
    // 生成每天的任务
    const planDays = document.getElementById('planDays');
    let html = '';
    
    for (const day of plan.days) {
        html += `
            <div class="day-item">
                <div class="day-header">
                    <div class="day-title">第 ${day.day} 天</div>
                    <div class="day-date">${formatDate(day.date)}</div>
                </div>
                <div class="day-words">
                    <div class="word-group">
                        <div class="word-group-title">📝 新学单词 (${day.newWords.length} 个)</div>
                        <div class="word-list">
        `;
        
        // 显示新学单词
        for (const word of day.newWords) {
            const displayWord = word.word || word.japanese || word['外来语'] || '未知';
            const displayMeaning = word.meaning || word.chinese || word['中文意思'] || '';
            html += `<span class="word-tag">${displayWord} - ${displayMeaning}</span>`;
        }
        
        html += `
                        </div>
                    </div>
                    <div class="word-group">
                        <div class="word-group-title">🔄 复习单词 (${day.reviewWords.length} 个)</div>
                        <div class="word-list">
        `;
        
        // 显示复习单词
        for (const word of day.reviewWords) {
            const displayWord = word.word || word.japanese || word['外来语'] || '未知';
            const displayMeaning = word.meaning || word.chinese || word['中文意思'] || '';
            html += `<span class="word-tag">${displayWord} - ${displayMeaning}</span>`;
        }
        
        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    planDays.innerHTML = html;
}

// 保存学习计划
function savePlan() {
    if (!window.currentStudyPlan) {
        alert('请先生成学习计划');
        return;
    }
    
    const taskManager = window.RiyuCommon.TaskManager;
    const success = taskManager.saveStudyPlan(window.currentStudyPlan);
    
    if (success) {
        alert('学习计划已保存');
    } else {
        alert('保存学习计划失败，请重试');
    }
}

// 打印学习计划
function printPlan() {
    if (!window.currentStudyPlan) {
        alert('请先生成学习计划');
        return;
    }
    
    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    
    // 生成打印内容
    let printContent = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>${window.currentStudyPlan.name}</title>
            <style>
                /* 基础样式 */
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #f8f0f6 0%, #fff0f5 100%);
                    color: #333;
                    margin: 20px;
                    line-height: 1.6;
                }
                h1 {
                    text-align: center;
                    color: #ff69b4;
                    margin-bottom: 30px;
                }
                
                /* 计划信息 */
                .plan-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8f0f6;
                    border-radius: 8px;
                }
                .plan-item {
                    display: flex;
                    flex-direction: column;
                }
                .plan-item-label {
                    font-size: 0.9rem;
                    color: #666;
                }
                .plan-item-value {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: #333;
                }
                
                /* 控制按钮 */
                .controls {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                }
                .btn {
                    background: linear-gradient(135deg, #ff69b4, #ff1493);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn:hover {
                    background: linear-gradient(135deg, #ff1493, #c71585);
                    transform: scale(1.05);
                }
                
                /* 加载提示 */
                .loading {
                    text-align: center;
                    color: #666;
                    margin: 20px 0;
                }
                
                /* 每天任务 */
                .day-item {
                    margin: 30px 0;
                    padding: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                .day-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #ffd1dc;
                }
                .day-title {
                    font-weight: bold;
                    font-size: 1.3rem;
                    color: #ff69b4;
                }
                .day-date {
                    color: #666;
                    font-size: 1rem;
                }
                
                /* 单词组 */
                .word-group {
                    margin: 20px 0;
                }
                .word-group-title {
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #ff69b4;
                    font-size: 1.1rem;
                }
                
                /* 单词卡片网格 */
                .word-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                /* 单词卡片样式 */
                .word-card {
                    background-color: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    position: relative;
                    border: 2px solid transparent;
                }
                .word-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    border-color: #ffb6c1;
                }
                
                /* 卡片头部 */
                .card-header {
                    padding: 20px;
                    background: linear-gradient(135deg, #fff0f5 0%, #ffffff 100%);
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 120px;
                    gap: 15px;
                }
                
                /* 单词信息 */
                .word-info {
                    text-align: center;
                    padding: 0 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    flex: 1;
                }
                .word-info:hover {
                    transform: scale(1.02);
                }
                
                /* 单词主文本 */
                .word-main {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 6px;
                    font-family: 'Noto Sans JP', sans-serif;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* 单词假名/拼音 */
                .word-kana {
                    font-size: 1.1rem;
                    color: #ff69b4;
                    font-weight: 500;
                    font-family: 'Noto Sans JP', sans-serif;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* 单词意思 */
                .word-meaning {
                    font-size: 0.95rem;
                    color: #666;
                    margin-top: 8px;
                    line-height: 1.4;
                }
                
                /* 音频图标 */
                .audio-container {
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%);
                    border-radius: 50%;
                }
                .audio-container:hover {
                    background: linear-gradient(135deg, #ffb6c1 0%, #ff69b4 100%);
                }
                .audio-icon {
                    font-size: 1.2rem;
                    color: #ff69b4;
                    transition: all 0.3s ease;
                }
                .audio-container:hover .audio-icon {
                    color: #fff;
                    transform: scale(1.1);
                }
                
                /* 外来语样式 */
                .loanword .word-main {
                    font-size: 2rem;
                }
                .loanword .word-kana {
                    font-size: 1.2rem;
                }
                
                /* 响应式设计 */
                @media (max-width: 768px) {
                    .word-cards-grid {
                        grid-template-columns: 1fr;
                    }
                    .plan-info {
                        grid-template-columns: 1fr;
                    }
                    .day-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <h1>${window.currentStudyPlan.name}</h1>
            <div class="plan-info">
                <div class="plan-item">
                    <div class="plan-item-label">开始日期</div>
                    <div class="plan-item-value">${formatDate(window.currentStudyPlan.startDate)}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-label">结束日期</div>
                    <div class="plan-item-value">${formatDate(window.currentStudyPlan.endDate)}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-label">总天数</div>
                    <div class="plan-item-value">${window.currentStudyPlan.totalDays} 天</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-label">每天新单词</div>
                    <div class="plan-item-value">${window.currentStudyPlan.dailyNewWords} 个</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-label">总单词数</div>
                    <div class="plan-item-value">${window.currentStudyPlan.totalWords} 个</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-label">复习比例</div>
                    <div class="plan-item-value">${window.currentStudyPlan.reviewRatio}:1</div>
                </div>
            </div>
            <div class="controls">
                <button class="btn" onclick="window.print()">打印计划</button>
                <button class="btn" onclick="window.close()">关闭窗口</button>
            </div>
            <p class="loading">正在加载学习计划...</p>
            <div id="planContent">
    `;
    
    // 添加每天的任务
    for (const day of window.currentStudyPlan.days) {
        printContent += `
            <div class="day-item">
                <div class="day-header">
                    <div class="day-title">第 ${day.day} 天</div>
                    <div class="day-date">${formatDate(day.date)}</div>
                </div>
        `;
        
        // 新学单词
        if (day.newWords.length > 0) {
            printContent += `
                <div class="word-group">
                    <div class="word-group-title">📝 新学单词 (${day.newWords.length} 个)</div>
                    <div class="word-cards-grid">
            `;
            
            for (const word of day.newWords) {
                const displayWord = word.word || word.japanese || word['外来语'] || '未知';
                const displayKana = word.kana || word.pronunciation || word['假名'] || '';
                const displayMeaning = word.meaning || word.chinese || word['中文意思'] || '';
                const isLoanword = word['外来语'] || displayWord.includes('—');
                const cardClass = isLoanword ? 'word-card loanword' : 'word-card';
                
                printContent += `
                        <div class="${cardClass}">
                            <div class="card-header">
                                <div class="word-info" onclick="speakWord('${displayWord}')">
                                    <div class="word-main">${displayWord}</div>
                                    ${displayKana ? `<div class="word-kana">${displayKana}</div>` : ''}
                                    <div class="word-meaning">${displayMeaning}</div>
                                </div>
                                <div class="audio-container" onclick="speakWord('${displayWord}')">
                                    <i class="fas fa-volume-up audio-icon"></i>
                                </div>
                            </div>
                        </div>
                `;
            }
            
            printContent += `
                    </div>
                </div>
            `;
        }
        
        // 复习单词
        if (day.reviewWords.length > 0) {
            printContent += `
                <div class="word-group">
                    <div class="word-group-title">🔄 复习单词 (${day.reviewWords.length} 个)</div>
                    <div class="word-cards-grid">
            `;
            
            for (const word of day.reviewWords) {
                const displayWord = word.word || word.japanese || word['外来语'] || '未知';
                const displayKana = word.kana || word.pronunciation || word['假名'] || '';
                const displayMeaning = word.meaning || word.chinese || word['中文意思'] || '';
                const isLoanword = word['外来语'] || displayWord.includes('—');
                const cardClass = isLoanword ? 'word-card loanword' : 'word-card';
                
                printContent += `
                        <div class="${cardClass}">
                            <div class="card-header">
                                <div class="word-info" onclick="speakWord('${displayWord}')">
                                    <div class="word-main">${displayWord}</div>
                                    ${displayKana ? `<div class="word-kana">${displayKana}</div>` : ''}
                                    <div class="word-meaning">${displayMeaning}</div>
                                </div>
                                <div class="audio-container" onclick="speakWord('${displayWord}')">
                                    <i class="fas fa-volume-up audio-icon"></i>
                                </div>
                            </div>
                        </div>
                `;
            }
            
            printContent += `
                    </div>
                </div>
            `;
        }
        
        printContent += `
            </div>
        `;
    }
    
    printContent += `
            </div>
            <div class="controls">
                <button class="btn" onclick="window.print()">打印计划</button>
                <button class="btn" onclick="window.close()">关闭窗口</button>
            </div>
            <script src="https://kit.fontawesome.com/a076d05399.js"></script>
            <script>
                // 语音合成功能
                const SpeechHelper = {
                    voicesLoaded: false,
                    availableVoices: [],
                    
                    // 初始化语音合成
                    init() {
                        if (!this.voicesLoaded) {
                            this.availableVoices = window.speechSynthesis.getVoices();
                            this.voicesLoaded = true;
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
                            console.error('语音合成失败:', error);
                        }
                    }
                };
                
                // 监听语音列表变化
                window.speechSynthesis.onvoiceschanged = () => SpeechHelper.init();
                
                // 初始化语音合成
                SpeechHelper.init();
                
                // 朗读单词
                function speakWord(word) {
                    SpeechHelper.speak(word);
                }
                
                // 页面加载完成后隐藏加载提示
                window.addEventListener('DOMContentLoaded', () => {
                    document.querySelector('.loading').style.display = 'none';
                    document.getElementById('planContent').style.display = 'block';
                });
            </script>
        </body>
        </html>
    `;
    
    // 写入打印窗口
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// 设置计划类型
function setPlanType(type) {
    const daysGroup = document.getElementById('daysGroup');
    const dailyWordsGroup = document.getElementById('dailyWordsGroup');
    
    if (type === 'days') {
        daysGroup.style.display = 'block';
        dailyWordsGroup.style.display = 'none';
    } else {
        daysGroup.style.display = 'none';
        dailyWordsGroup.style.display = 'block';
    }
}

// 重置表单
function resetForm() {
    // 重置计划类型
    setPlanType('days');
    
    // 重置输入值
    document.getElementById('totalDays').value = 30;
    document.getElementById('dailyNewWords').value = 20;
    document.getElementById('reviewRatio').value = 1;
    
    // 重置模块选择
    const moduleCheckboxes = document.querySelectorAll('input[name="modules"]');
    moduleCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // 隐藏结果区域
    const resultDiv = document.getElementById('studyPlanResult');
    resultDiv.classList.remove('show');
    
    // 清除全局变量
    window.currentStudyPlan = null;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 绑定事件
function bindEvents() {
    // 计划类型切换
    const planTypeRadios = document.querySelectorAll('input[name="planType"]');
    planTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            setPlanType(e.target.value);
        });
    });
    
    // 生成计划按钮
    document.getElementById('generatePlanBtn').addEventListener('click', generatePlan);
    
    // 重置按钮
    document.getElementById('resetPlanBtn').addEventListener('click', resetForm);
    
    // 保存计划按钮
    document.getElementById('savePlanBtn').addEventListener('click', savePlan);
    
    // 打印计划按钮
    document.getElementById('printPlanBtn').addEventListener('click', printPlan);
}