@echo off
chcp 65001 >nul
echo ================================================
echo   为你好心语 - 一键部署到 Vercel
echo ================================================
echo.

set /p TOKEN="请粘贴你的 Vercel Token（去 https://vercel.com/account/tokens 生成）："

echo.
echo 正在打包文件...
powershell -Command "Compress-Archive -Path 'C:\Users\Administrator\.qclaw\workspace\healing-ai-app\dist\*' -DestinationPath 'C:\Users\Administrator\.qclaw\workspace\healing-app.zip' -Force"

echo.
echo 正在上传并部署到 Vercel...

powershell -Command "
$headers = @{ Authorization = 'Bearer %TOKEN%'; 'Content-Type' = 'application/json' }
$projectBody = @{ name = 'healing-ai-app'; framework = 'vite' } | ConvertTo-Json
$projResp = Invoke-RestMethod -Uri 'https://api.vercel.com/v1/projects' -Method POST -Headers $headers -Body $projectBody
$proj = $projResp
Write-Host 'Project ID:' $proj.id

$zipBytes = [System.IO.File]::ReadAllBytes('C:\Users\Administrator\.qclaw\workspace\healing-app.zip')
$zipBase64 = [Convert]::ToBase64String($zipBytes)
$deployBody = @{ name = 'healing-ai-app'; projectId = $proj.id; zipFile = $zipBase64 } | ConvertTo-Json
$deployResp = Invoke-RestMethod -Uri 'https://api.vercel.com/v13/deployments' -Method POST -Headers $headers -Body $deployBody
Write-Host 'Deployment URL:' $deployResp.url
Write-Host 'Deployment ID:' $deployResp.id
" 2>&1

echo.
echo 部署完成！
pause
