' ============================================================
'  Skinvault CRM — запуск одним двойным щелчком, без консоли
'  Просто открывает готовое приложение в браузере по умолчанию.
'  Данные хранятся прямо в браузере на этом компьютере.
' ============================================================

Dim fso, shell, scriptDir, appFile

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
appFile = fso.BuildPath(scriptDir, "dist\index.html")

If fso.FileExists(appFile) Then
    shell.Run """" & appFile & """", 1, False
Else
    MsgBox "Файл приложения не найден:" & vbCrLf & appFile & vbCrLf & vbCrLf & _
           "Похоже, сборка отсутствует. Запустите 'Пересобрать CRM.bat' один раз.", _
           vbExclamation, "Skinvault CRM"
End If
