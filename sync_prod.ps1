# XACK Production Sync Script (Versao Compativel)
# Este script envia as alteracoes locais para o GitHub para disparar o deploy na VPS.

$REPO_USER = "dionebr"
$REPO_NAME = "xack"
$BRANCH = "master"

Write-Host "Iniciando sincronizacao para Producao (GitHub/VPS)..." -ForegroundColor Cyan

# Check for git changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nenhuma alteracao pendente para sincronizar." -ForegroundColor Green
    exit
}

# Add, commit and push
Write-Host "Preparando alteracoes..."
git add .

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = "Production Overhaul and Security Hardening - $timestamp"

Write-Host "Fazendo commit: $commitMsg"
git commit -m $commitMsg

Write-Host "Enviando para GitHub ($REPO_USER/$REPO_NAME)..."
git push origin $BRANCH

if ($LASTEXITCODE -eq 0) {
    Write-Host "Sincronizacao concluida com sucesso!" -ForegroundColor Green
    Write-Host "Acesse a VPS (76.13.236.223) e execute:" -ForegroundColor Yellow
    Write-Host "   cd /opt/xack" -ForegroundColor White
    Write-Host "   git pull origin $BRANCH" -ForegroundColor White
    Write-Host "   docker-compose up --build -d" -ForegroundColor White
}
else {
    Write-Host "Falha na sincronizacao. Verifique sua conexao e permissoes do Git." -ForegroundColor Red
}
