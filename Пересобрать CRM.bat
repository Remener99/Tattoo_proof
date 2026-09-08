@echo off
chcp 65001 >nul
setlocal
rem ============================================================
rem  Skinvault CRM — пересборка приложения
rem  Запускайте этот файл ТОЛЬКО если меняли исходный код
rem  (папку src) и хотите обновить dist\index.html.
rem  Для обычного открытия CRM используйте "Открыть CRM.vbs".
rem ============================================================

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [Ошибка] Node.js не найден. Установите его с https://nodejs.org/ и повторите.
    pause
    exit /b 1
)

echo Устанавливаю зависимости (нужно один раз, дальше будет пропускаться)...
call npm install
if errorlevel 1 (
    echo [Ошибка] npm install завершился с ошибкой.
    pause
    exit /b 1
)

echo Собираю приложение...
call npm run build
if errorlevel 1 (
    echo [Ошибка] Сборка завершилась с ошибкой.
    pause
    exit /b 1
)

echo.
echo Готово! Теперь можно открывать CRM файлом "Открыть CRM.vbs".
pause
