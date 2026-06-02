#!/usr/bin/env pwsh

# 进入项目目录
Set-Location -Path "c:\claude\offerpilot"

Write-Host "开始安装依赖..." -ForegroundColor Green

# 安装 npm 依赖
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "依赖安装成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在可以运行以下命令启动开发服务器：" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "安装失败，请检查错误信息" -ForegroundColor Red
}