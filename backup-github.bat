@echo off
echo ========================================
echo   XACK - Backup Automatico para GitHub
echo ========================================
echo.

cd c:\xampp\htdocs\xack

echo [1/5] Mudando para branch dev...
git checkout dev

echo [2/5] Puxando ultimas alteracoes...
git pull origin dev

echo [3/5] Verificando alteracoes...
git status

echo [4/5] Adicionando arquivos modificados...
git add .

echo [5/5] Fazendo commit e push...
git commit -m "Auto backup - %date% %time%"
git push origin dev

echo.
echo ========================================
echo   Backup concluido com sucesso!
echo ========================================
echo.
pause
