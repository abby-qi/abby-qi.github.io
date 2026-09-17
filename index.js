class ScoreManager {
    constructor() {
        this.rules = [];
        this.summary = {};
        this.courses = [];
        this.courseCategories = [
            { name: '公共基础课', containerId: 'sms-course-public-basic', hasNote: false },
            { name: '专业基础课', containerId: 'sms-course-major-basic', hasNote: false },
            { name: '专业课', containerId: 'sms-course-major', hasNote: false },
            { name: '综合实践课', containerId: 'sms-course-practice', hasNote: false },
            { name: '跨专业交叉课', containerId: 'sms-course-cross-major', noteId: 'sms-note-cross-major', hasNote: true },
            { name: '专业选修课', containerId: 'sms-course-major-elective', noteId: 'sms-note-major-elective', hasNote: true },
            { name: '公共选修课', containerId: 'sms-course-public-elective', noteId: 'sms-note-public-elective', hasNote: true }
        ];
        this.init();
    }

    async init() {
        try {
            await Promise.all([
                this.loadRules(),
                this.loadSummary(),
                this.loadCourses()
            ]);
            this.render();
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    async loadCSV(filename) {
        // 追加时间戳参数，避免浏览器或中间层缓存旧的 CSV 数据
        const url = filename + (filename.includes('?') ? '&' : '?') + '_t=' + Date.now();
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('加载 ' + filename + ' 失败: HTTP ' + response.status);
        }

        // 按字节读取，以便自动识别编码
        const buffer = await response.arrayBuffer();
        const text = this.decodeCSV(buffer, filename);
        return this.parseCSV(text, filename);
    }

    /**
     * 解码 CSV 字节流。
     * 支持 UTF-8 / UTF-8 BOM / GBK。
     * 若文件被以 GBK 保存而浏览器按 UTF-8 硬解，中文会变成乱码导致字段全部失配，
     * 这里通过“严格 UTF-8 试探 + GBK 兜底”避免该问题。
     */
    decodeCSV(buffer, filename) {
        const bytes = new Uint8Array(buffer);

        // UTF-8 BOM
        if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
            return new TextDecoder('utf-8').decode(bytes.subarray(3));
        }
        // UTF-16 LE / BE
        if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
            return new TextDecoder('utf-16le').decode(bytes.subarray(2));
        }
        if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
            return new TextDecoder('utf-16be').decode(bytes.subarray(2));
        }

        // 严格 UTF-8 试探：成功则按 UTF-8 处理
        try {
            return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch (e) {
            // 失败则尝试 GBK（中文 Windows 下 Excel 另存 CSV 的常见编码）
            try {
                const text = new TextDecoder('gbk').decode(bytes);
                console.warn(filename + ' 不是 UTF-8 编码，已按 GBK 解码。建议将文件另存为 UTF-8。');
                return text;
            } catch (e2) {
                console.warn(filename + ' 编码无法识别，回退为 UTF-8 宽容解码。');
                return new TextDecoder('utf-8').decode(bytes);
            }
        }
    }

    parseCSV(text, filename) {
        // 去除 UTF-8 BOM，并统一换行符，避免首列键名被污染
        const clean = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
        const lines = clean.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        const skipped = [];

        // 检测解码后是否残留替换字符（编码错乱的典型特征）
        if (clean.includes('\uFFFD')) {
            console.error((filename || 'CSV') + ' 解码后出现乱码字符，文件编码可能不是 UTF-8，请另存为 UTF-8 后重试。');
        }

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            } else {
                skipped.push({ line: i + 1, got: values.length, expect: headers.length });
            }
        }

        if (skipped.length) {
            console.warn('CSV 存在列数不匹配的行，已跳过:', skipped);
        }

        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());

        return result;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    checkPermission(element) {
        const permission = element.getAttribute('data-permission');
        if (permission === 'read') {
            return true;
        }
        return true;
    }

    async loadRules() {
        this.rules = await this.loadCSV('data/rules.csv');
    }

    async loadSummary() {
        const summaryData = await this.loadCSV('data/summary.csv');
        this.summary = {};
        summaryData.forEach(row => {
            this.summary[row.key] = row.value;
        });
    }

    async loadCourses() {
        this.courses = await this.loadCSV('data/courses.csv');
    }

    calculateGPA() {
        let totalPoints = 0;
        let totalCredits = 0;

        this.courses.forEach(course => {
            const credits = parseFloat(course.学分);

            // 仅统计已修完（有成绩）的课程
            if (course.修读状态 !== '完成' || !(credits > 0)) {
                return;
            }

            // 优先采用成绩单给出的「绩点」；缺失时回退到按成绩换算
            let point = this.parsePoint(course.绩点);
            if (point === null) {
                point = this.parseGrade(course.成绩);
            }
            if (point === null) {
                return;
            }

            totalPoints += point * credits;
            totalCredits += credits;
        });

        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '--';
    }

    parsePoint(value) {
        if (value === undefined || value === null) return null;
        const str = String(value).trim();
        if (!str || ['-', '未修', '在读', '免修', '进行中', '待出分'].includes(str)) {
            return null;
        }
        const num = parseFloat(str);
        return isNaN(num) ? null : num;
    }

    parseGrade(gradeStr) {
        if (!gradeStr || gradeStr === '-' || gradeStr === '未修' || gradeStr === '待出分' || gradeStr === '进行中' || gradeStr === '免修') {
            return null;
        }

        const gradeMap = {
            '优秀': 4.5,
            '良好': 3.5,
            '中等': 2.5,
            '及格': 1.5,
            '不及格': 0,
            '通过': 1
        };

        if (gradeMap[gradeStr] !== undefined) {
            return gradeMap[gradeStr];
        }

        const numGrade = parseFloat(gradeStr);
        if (!isNaN(numGrade)) {
            if (numGrade >= 60) {
                return (numGrade / 10) - 5;
            }
            return 0;
        }

        return null;
    }

    getGradeClass(grade) {
        if (grade === '未修') return 'grade-pending';
        if (grade === '待出分') return 'grade-pending';
        if (grade === '进行中') return 'grade-ongoing';
        if (grade === '在读') return 'grade-ongoing';
        if (grade === '免修') return 'grade-exempt';
        if (grade === '优秀') return 'grade-excellent';
        if (grade === '良好') return 'grade-good';
        if (grade === '中等') return 'grade-medium';
        if (grade === '及格') return 'grade-pass';
        if (grade === '不及格') return 'grade-fail';
        if (grade === '通过') return 'grade-pass';

        const numGrade = parseFloat(grade);
        if (!isNaN(numGrade)) {
            if (numGrade >= 90) return 'grade-excellent';
            if (numGrade >= 80) return 'grade-good';
            if (numGrade >= 70) return 'grade-medium';
            if (numGrade >= 60) return 'grade-pass';
            return 'grade-fail';
        }

        return '';
    }

    getStatusClass(status) {
        const statusMap = {
            '完成': 'status-completed',
            '进行中': 'status-ongoing',
            '在读': 'status-enrolled',
            '待出分': 'status-pending',
            '未修': 'status-not-taken',
            '免修': 'status-exempt'
        };
        return statusMap[status] || '';
    }

    renderRules() {
        const container = document.getElementById('sms-rules-container');
        if (!container || !this.checkPermission(container)) return;

        const ul = document.createElement('ul');
        ul.className = 'rules-list';

        this.rules.forEach(rule => {
            const li = document.createElement('li');
            
            const content = rule.content;
            
            if (content.includes('（一）') || content.includes('（二）') || content.includes('（三）') || 
                content.includes('（四）') || content.includes('（五）')) {
                
                const parts = content.split(/（[一二三四五六七八九十]+）/).filter(p => p.trim());
                const markers = content.match(/（[一二三四五六七八九十]+）/g) || [];
                
                const titleStrong = document.createElement('strong');
                titleStrong.textContent = rule.title + ':';
                li.appendChild(titleStrong);
                
                if (parts.length > 0) {
                    const subItemsDiv = document.createElement('div');
                    subItemsDiv.className = 'rule-sub-items';
                    
                    parts.forEach((part, index) => {
                        const marker = markers[index] || '';
                        const subItemDiv = document.createElement('div');
                        subItemDiv.className = 'rule-sub-item';
                        
                        const markerSpan = document.createElement('span');
                        markerSpan.className = 'rule-marker';
                        markerSpan.textContent = marker;
                        
                        const textSpan = document.createElement('span');
                        textSpan.className = 'rule-text';
                        textSpan.textContent = part.trim();
                        
                        subItemDiv.appendChild(markerSpan);
                        subItemDiv.appendChild(textSpan);
                        subItemsDiv.appendChild(subItemDiv);
                    });
                    
                    li.appendChild(subItemsDiv);
                }
            } else {
                const titleStrong = document.createElement('strong');
                titleStrong.textContent = rule.title + ':';
                li.appendChild(titleStrong);
                
                const textNode = document.createTextNode(' ' + content);
                li.appendChild(textNode);
            }
            
            ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    renderSummary() {
        const container = document.getElementById('sms-summary-container');
        if (!container || !this.checkPermission(container)) return;

        const grid = document.createElement('div');
        grid.className = 'summary-grid';

        const summaryItems = [
            { key: '计划总课程', label: '计划总课程' },
            { key: '通过', label: '通过课程' },
            { key: '未通过', label: '未通过课程' },
            { key: '未修', label: '未修课程' },
            { key: '在读', label: '在读课程' },
            { key: '免修', label: '免修课程' },
            { key: '必修课获得学分', label: '必修课获得学分', subKey: '必修课要求学分' },
            { key: '公共基础课获得学分', label: '公共基础课学分', subKey: '公共基础课要求学分' },
            { key: '专业基础课获得学分', label: '专业基础课学分', subKey: '专业基础课要求学分' },
            { key: '专业课获得学分', label: '专业课学分', subKey: '专业课要求学分' },
            { key: '综合实践课获得学分', label: '综合实践课学分', subKey: '综合实践课要求学分' },
            { key: '选修课获得学分', label: '选修课学分', subKey: '选修课要求学分' }
        ];

        summaryItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            const h3 = document.createElement('h3');
            h3.textContent = item.label;
            card.appendChild(h3);
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'value';
            valueDiv.textContent = this.summary[item.key] || '--';
            card.appendChild(valueDiv);
            
            if (item.subKey) {
                const subValueDiv = document.createElement('div');
                subValueDiv.className = 'sub-value';
                subValueDiv.textContent = '要求: ' + (this.summary[item.subKey] || '--');
                card.appendChild(subValueDiv);
            }
            
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    renderCourseTable(courses) {
        if (courses.length === 0) {
            const div = document.createElement('div');
            div.className = 'sms-empty-state';
            div.textContent = '暂无课程数据';
            return div;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headers = ['修读状态', '成绩学年', '学期', '课程号', '课程名称', '学时', '课程性质', '学分', '课程类别', '最大成绩', '成绩', '绩点', '补考', '重修', '建议修读学年', '建议修读学期', '课程重要性系数'];

        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        courses.forEach(course => {
            const row = document.createElement('tr');

            const statusCell = document.createElement('td');
            statusCell.className = this.getStatusClass(course.修读状态);
            statusCell.textContent = course.修读状态;
            row.appendChild(statusCell);

            const fields = ['成绩学年', '学期', '课程号', '课程名称', '学时', '课程性质', '学分', '课程类别', '最大成绩'];
            fields.forEach(field => {
                const td = document.createElement('td');
                td.textContent = course[field];
                row.appendChild(td);
            });

            const gradeCell = document.createElement('td');
            gradeCell.className = this.getGradeClass(course.成绩);
            gradeCell.textContent = course.成绩;
            row.appendChild(gradeCell);

            const pointCell = document.createElement('td');
            pointCell.textContent = course.绩点;
            row.appendChild(pointCell);

            const bukaoCell = document.createElement('td');
            bukaoCell.textContent = course.补考;
            row.appendChild(bukaoCell);

            const chongxiuCell = document.createElement('td');
            chongxiuCell.textContent = course.重修;
            row.appendChild(chongxiuCell);

            const extraFields = ['建议修读学年', '建议修读学期', '课程重要性系数'];
            extraFields.forEach(field => {
                const td = document.createElement('td');
                td.textContent = course[field];
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

    /**
     * 渲染课程分类下方的备注。
     * 数据来源优先级：
     *   1) summary.csv 中的「备注_<类别名>」键（类别级备注，推荐）
     *   2) courses.csv 中该类别课程「注释」列的首个非空值（兼容旧数据）
     * 备注文本可用「；」分隔，将按多行展示；无备注时隐藏容器，避免出现空色块。
     */
    renderSectionNote(category, noteId) {
        const container = document.getElementById(noteId);
        if (!container) return;

        let note = (this.summary['备注_' + category] || '').trim();

        if (!note) {
            const course = this.courses.find(c => c.课程类别 === category && c.注释 && c.注释.trim());
            if (course) note = course.注释.trim();
        }

        container.textContent = '';

        if (!note) {
            container.style.display = 'none';
            return;
        }

        note.split(/[；;]/).map(s => s.trim()).filter(Boolean).forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'section-note-line';
            lineDiv.textContent = line;
            container.appendChild(lineDiv);
        });

        container.style.display = '';
    }

    renderCourseSection(category) {
        const container = document.getElementById(category.containerId);
        if (!container || !this.checkPermission(container)) return;

        const filteredCourses = this.courses.filter(course => course.课程类别 === category.name);
        container.appendChild(this.renderCourseTable(filteredCourses));

        if (category.hasNote && category.noteId) {
            this.renderSectionNote(category.name, category.noteId);
        }
    }

    renderCourseSections() {
        this.courseCategories.forEach(category => {
            this.renderCourseSection(category);
        });
    }

    renderStatTime() {
        const container = document.getElementById('sms-stat-time');
        if (!container) return;

        const time = this.summary['统计时间'];
        if (!time) {
            container.style.display = 'none';
            return;
        }

        container.textContent = '数据统计时间：' + time + '（截至该时间有效）';
    }

    render() {
        const gpa = this.calculateGPA();
        const gpaElement = document.getElementById('sms-total-gpa');
        if (gpaElement) {
            gpaElement.textContent = gpa;
        }

        this.renderStatTime();
        this.renderRules();
        this.renderSummary();
        this.renderCourseSections();
    }

    async refresh() {
        await this.init();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.scoreManager = new ScoreManager();
});