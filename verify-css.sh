#!/bin/bash

# GitHub Pages CSS 加载问题修复验证脚本

echo "=========================================="
echo "GitHub Pages CSS 加载问题修复验证"
echo "=========================================="
echo ""

# 检查 common.css 中是否有 @import
echo "1. 检查 common.css 中是否还有 @import 语句..."
if grep -q "@import" css/common.css; then
    echo "   ❌ 错误：common.css 中仍然包含 @import 语句"
    grep -n "@import" css/common.css
    exit 1
else
    echo "   ✅ 通过：common.css 中没有 @import 语句"
fi
echo ""

# 检查所有 HTML 文件是否正确引入了 CSS
echo "2. 检查 HTML 文件的 CSS 引入..."

# 定义函数：检查 HTML 文件
check_html_css() {
    local file=$1
    local has_common=$(grep -c 'css/common.css' "$file" || true)
    local has_main=$(grep -c 'css/main.css' "$file" || true)

    if [ "$has_common" -ge 1 ] && [ "$has_main" -ge 1 ]; then
        echo "   ✅ $file"
        return 0
    else
        echo "   ❌ $file (common.css: $has_common, main.css: $has_main)"
        return 1
    fi
}

# 检查主页面
check_html_css "index.html"

# 检查功能页面
for file in pages/*.html; do
    check_html_css "$file"
done

# 检查模块页面
for file in modules/*/index.html; do
    check_html_css "$file"
done

echo ""
echo "3. 检查 CSS 文件是否存在..."
for css_file in css/*.css; do
    if [ -f "$css_file" ]; then
        echo "   ✅ $css_file"
    else
        echo "   ❌ $css_file 不存在"
        exit 1
    fi
done

echo ""
echo "4. 检查配置文件..."
for config_file in _config.yml _redirects .gitignore; do
    if [ -f "$config_file" ]; then
        echo "   ✅ $config_file"
    else
        echo "   ⚠️  $config_file 不存在（可选）"
    fi
done

echo ""
echo "=========================================="
echo "验证完成！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 本地测试：python -m http.server 8000"
echo "2. 提交代码：git add . && git commit -m '修复 CSS 加载问题'"
echo "3. 推送到 GitHub：git push origin main"
echo "4. 等待部署并访问 https://abby-qi.github.io"
echo ""
