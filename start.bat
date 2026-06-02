@echo off
echo ========================================
echo   OfferPilot 项目启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查Node.js版本...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未安装Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/3] 安装依赖...
if exist "node_modules" (
    echo 依赖已存在，跳过安装
) else (
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo [3/3] 启动开发服务器...
echo.
echo 启动成功！请访问: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm run dev
