@echo off
echo ========================================
echo OfferPilot - 安装依赖并启动项目
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 正在安装 npm 依赖...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [错误] 安装依赖失败！
    pause
    exit /b 1
)

echo.
echo [2/2] 依赖安装成功！
echo.
echo 正在启动开发服务器...
echo.

call npm run dev

pause