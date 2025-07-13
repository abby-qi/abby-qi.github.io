// 主题切换功能
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // 主题切换按钮点击事件
    themeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);
    });
    
    // 初始化主题
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const isDarkMode = savedTheme === 'dark';
    body.classList.toggle('dark-mode', isDarkMode);
    updateThemeIcon(isDarkMode);
    
    // 更新主题图标
    function updateThemeIcon(isDarkMode) {
        themeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
    }
    
    // 响应式导航菜单
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            menuToggle.innerHTML = isExpanded ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
    
    // 点击导航链接后关闭菜单
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // 滚动时导航栏效果
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // 动态加载文章列表
    const posts = [
        {
            date: '2024-03-15',
            title: 'Hello World',
            excerpt: '这是我的第一篇技术博客，分享我对编程和技术的热爱与见解...',
            tags: ['JavaScript', 'Web开发'],
            slug: 'hello-world'
        },
        {
            date: '2024-03-20',
            title: '现代CSS技巧与最佳实践',
            excerpt: '探索现代CSS的强大功能，包括Grid布局、Flexbox和CSS变量等...',
            tags: ['CSS', '前端'],
            slug: 'modern-css-tips'
        },
        {
            date: '2024-03-25',
            title: 'React性能优化指南',
            excerpt: '学习如何优化React应用性能，避免常见陷阱，提升用户体验...',
            tags: ['React', '性能优化'],
            slug: 'react-performance'
        }
        // 可以添加更多文章数据
    ];
    
    // 如果页面上没有文章卡片，则动态加载
    const postsContainer = document.querySelector('.posts-grid');
    if (postsContainer && postsContainer.children.length === 0) {
        renderPosts();
    }
    
    function renderPosts() {
        if (!postsContainer) return;
        
        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-card';
            
            // 使用日期格式化
            const postDate = new Date(post.date);
            const formattedDate = postDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '.');
            
            article.innerHTML = `
                <time datetime="${post.date}">${formattedDate}</time>
                <h2><a href="./posts/${post.slug}.html">${post.title}</a></h2>
                <div class="post-excerpt">${post.excerpt}</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `;
            postsContainer.appendChild(article);
        });
    }
    
    // 添加文章阅读进度条
    if (document.querySelector('.post-content')) {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.pageYOffset / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
        });
    }
    
    // 初始化表单提交
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            
            // 这里应该添加实际的表单提交逻辑
            // 现在只是显示一个简单的成功消息
            alert(`感谢订阅！我们会将最新内容发送到 ${emailInput.value}`);
            emailInput.value = '';
        });
    }
    
    // 初始化代码高亮
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
    
    // 添加图片懒加载
    if ('loading' in HTMLImageElement.prototype) {
        // 浏览器支持原生懒加载
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // 回退到 Intersection Observer
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window && lazyImages.length > 0) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        imageObserver.unobserve(image);
                    }
                });
            });
            
            lazyImages.forEach(image => {
                imageObserver.observe(image);
            });
        }
    }
    
    // 评论功能
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        const commentsContainer = document.querySelector('.comments-list');
        const commentCount = document.querySelector('.comment-count');
        
        // 模拟评论数据
        const savedComments = JSON.parse(localStorage.getItem('blogComments') || '{}');
        const postSlug = window.location.pathname.split('/').pop().replace('.html', '');
        const postComments = savedComments[postSlug] || [];
        
        // 显示已有评论
        function renderComments() {
            if (!commentsContainer) return;
            
            commentsContainer.innerHTML = '';
            
            if (postComments.length === 0) {
                commentsContainer.innerHTML = '<div class="no-comments">暂无评论，成为第一个评论的人吧！</div>';
                if (commentCount) commentCount.textContent = '0';
                return;
            }
            
            postComments.forEach((comment, index) => {
                const commentEl = document.createElement('div');
                commentEl.className = 'comment';
                commentEl.innerHTML = `
                    <div class="comment-avatar">
                        <img src="https://www.gravatar.com/avatar/${Math.floor(Math.random() * 1000)}?d=identicon&s=60" alt="用户头像">
                    </div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <h4>${comment.name}</h4>
                            <time>${comment.date}</time>
                        </div>
                        <div class="comment-body">
                            <p>${comment.content}</p>
                        </div>
                        <div class="comment-actions">
                            <button class="comment-reply" data-index="${index}">回复</button>
                            <button class="comment-like" data-index="${index}">
                                <i class="far fa-heart"></i> <span>${comment.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                `;
                commentsContainer.appendChild(commentEl);
            });
            
            if (commentCount) commentCount.textContent = postComments.length.toString();
            
            // 添加点赞功能
            document.querySelectorAll('.comment-like').forEach(button => {
                button.addEventListener('click', () => {
                    const index = parseInt(button.dataset.index);
                    if (!postComments[index].likes) postComments[index].likes = 0;
                    postComments[index].likes++;
                    
                    // 更新显示
                    button.querySelector('span').textContent = postComments[index].likes;
                    button.querySelector('i').className = 'fas fa-heart';
                    
                    // 保存到本地存储
                    savedComments[postSlug] = postComments;
                    localStorage.setItem('blogComments', JSON.stringify(savedComments));
                });
            });
            
            // 添加回复功能
            document.querySelectorAll('.comment-reply').forEach(button => {
                button.addEventListener('click', () => {
                    const index = parseInt(button.dataset.index);
                    const replyTo = postComments[index].name;
                    
                    // 滚动到评论表单
                    commentForm.scrollIntoView({ behavior: 'smooth' });
                    
                    // 设置回复提示
                    const contentField = commentForm.querySelector('textarea');
                    contentField.value = `@${replyTo} `;
                    contentField.focus();
                });
            });
        }
        
        // 初始化评论
        renderComments();
        
        // 提交评论
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = commentForm.querySelector('input[name="name"]');
            const emailInput = commentForm.querySelector('input[name="email"]');
            const contentInput = commentForm.querySelector('textarea[name="comment"]');
            
            if (!nameInput.value || !emailInput.value || !contentInput.value) {
                alert('请填写所有必填字段');
                return;
            }
            
            // 创建新评论
            const newComment = {
                name: nameInput.value,
                email: emailInput.value,
                content: contentInput.value,
                date: new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                likes: 0
            };
            
            // 添加到评论列表
            postComments.push(newComment);
            savedComments[postSlug] = postComments;
            localStorage.setItem('blogComments', JSON.stringify(savedComments));
            
            // 重新渲染评论
            renderComments();
            
            // 重置表单
            commentForm.reset();
            
            // 显示成功消息
            const successMessage = document.createElement('div');
            successMessage.className = 'comment-success';
            successMessage.textContent = '评论提交成功！';
            commentForm.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        });
    }
    
    // 社交分享功能
    const shareButtons = document.querySelectorAll('.share-button');
    if (shareButtons.length > 0) {
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const platform = button.dataset.platform;
                const postTitle = document.title;
                const postUrl = window.location.href;
                
                let shareUrl;
                
                switch (platform) {
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
                        break;
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
                        break;
                    case 'weibo':
                        shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}`;
                        break;
                    case 'wechat':
                        // 对于微信，通常需要生成二维码
                        alert('请打开微信，使用"扫一扫"功能扫描网页中的二维码进行分享。');
                        return;
                    default:
                        return;
                }
                
                // 打开分享窗口
                window.open(shareUrl, 'share-window', 'height=450, width=550, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
            });
        });
    }
    
    // 目录导航功能
    const tocContainer = document.querySelector('.table-of-contents');
    if (tocContainer && document.querySelector('.post-content')) {
        const headings = document.querySelectorAll('.post-content h2, .post-content h3');
        
        if (headings.length > 0) {
            const tocList = document.createElement('ul');
            tocContainer.appendChild(tocList);
            
            headings.forEach((heading, index) => {
                // 为每个标题添加ID，以便链接
                if (!heading.id) {
                    heading.id = `heading-${index}`;
                }
                
                const listItem = document.createElement('li');
                listItem.className = heading.tagName.toLowerCase();
                
                const link = document.createElement('a');
                link.href = `#${heading.id}`;
                link.textContent = heading.textContent;
                
                listItem.appendChild(link);
                tocList.appendChild(listItem);
                
                // 点击滚动到对应位置
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelector(`#${heading.id}`).scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
            
            // 滚动时高亮当前标题
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                
                headings.forEach((heading, index) => {
                    const rect = heading.getBoundingClientRect();
                    const tocLink = tocList.querySelectorAll('a')[index];
                    
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        tocLink.classList.add('active');
                    } else {
                        tocLink.classList.remove('active');
                    }
                });
            });
        } else {
            tocContainer.style.display = 'none';
        }
    }
});