@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM GitHub Pages CSS 加载问题修复验证脚本（Windows 版本）

echo ==========================================
echo GitHub Pages CSS 加载问题修复验证
echo ==========================================
echo.

REM 检查 common.css 中是否有 @import
echo 1. 检查 common.css 中是否还有 @import 语句...
findstr /C:"@import" css\common.css >nul
if !errorlevel! equ 0 (
    echo    ❌ 错误：common.css 中仍然包含 @import 语句
    findstr /N /C:"@import" css\common.css
    pause
    exit /b 1
) else (
    echo    ✅ 通过：common.css 中没有 @import 语句
)
echo.

REM 检查主页面
echo 2. 检查 HTML 文件的 CSS 引入...
findstr /C:"css/common.css" index.html >nul
if !errorlevel! equ 0 (
    findstr /C:"css/main.css" index.html >nul
    if !errorlevel! equ 0 (
        echo    ✅ index.html
    ) else (
        echo    ❌ index.html 缺少 main.css
    )
) else (
    echo    ❌ index.html 缺少 common.css
)

REM 检查功能页面
for %%f in (pages\*.html) do (
    findstr /C:"css/common.css" %%f >nul
    if !errorlevel! equ 0 (
        findstr /C:"css/main.css" %%f >nul
        if !errorlevel! equ 0 (
            echo    ✅ %%f
        ) else (
            echo    ❌ %%f 缺少 main.css
        )
    ) else (
        echo    ❌ %%f 缺少 common.css
    )
)

REM 检查模块页面
for %%f in (modules\*\index.html) do (
    findstr /C:"css/common.css" %%f >nul
    if !errorlevel! equ 0 (
        findstr /C:"css/main.css" %%f >nul
        if !errorlevel! equ 0 (
            echo    ✅ %%f
        ) else (
            echo    ❌ %%f 缺少 main.css
        )
    ) else (
        echo    ❌ %%f 缺少 common.css
    )
)

echo.
echo 3. 检查 CSS 文件是否存在...
for %%f in (css\*.css) do (
    if exist "%%f" (
        echo    ✅ %%f
    ) else (
        echo    ❌ %%f 不存在
        pause
        exit /b 1
    )
)

echo.
echo 4. 检查配置文件...
for %%f in (_config.yml _redirects .gitignore) do (
    if exist "%%f" (
        echo    ✅ %%f
    ) else (
        echo    ⚠️  %%f 不存在（可选）
    )
)

echo.
echo ==========================================
echo 验证完成！
echo ==========================================
echo.
echo 下一步操作：
echo 1. 本地测试：python -m http.server 8000
echo 2. 提交代码：git add . ^&^& git commit -m "修复 CSS 加载问题"
echo 3. 推送到 GitHub：git push origin main
echo 4. 等待部署并访问 https://abby-qi.github.io
echo.
pause
