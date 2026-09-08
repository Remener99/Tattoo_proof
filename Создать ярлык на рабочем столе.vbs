' ============================================================
'  Создаёт на Рабочем столе ярлык "Skinvault CRM" с фирменной
'  иконкой, указывающий на "Открыть CRM.vbs".
'  Запустите этот файл ОДИН РАЗ (двойным щелчком).
' ============================================================

Dim fso, shell, scriptDir, targetFile, iconFile, desktopPath, shortcutPath, shortcut

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
targetFile = fso.BuildPath(scriptDir, "Открыть CRM.vbs")
iconFile = fso.BuildPath(scriptDir, "icons\skinvault.ico")
desktopPath = shell.SpecialFolders("Desktop")
shortcutPath = fso.BuildPath(desktopPath, "Skinvault CRM.lnk")

If Not fso.FileExists(targetFile) Then
    MsgBox "Не найден файл:" & vbCrLf & targetFile & vbCrLf & vbCrLf & _
           "Убедитесь, что запускаете этот .vbs из папки проекта.", _
           vbCritical, "Skinvault CRM"
    WScript.Quit
End If

If Not fso.FileExists(iconFile) Then
    MsgBox "Не найден файл иконки:" & vbCrLf & iconFile, vbExclamation, "Skinvault CRM"
    WScript.Quit
End If

Set shortcut = shell.CreateShortcut(shortcutPath)
shortcut.TargetPath = targetFile
shortcut.WorkingDirectory = scriptDir
shortcut.IconLocation = iconFile & ",0"
shortcut.Description = "Открыть Skinvault CRM"
shortcut.WindowStyle = 1
shortcut.Save

MsgBox "Готово! На Рабочем столе появился ярлык ""Skinvault CRM"" с фирменной иконкой." & vbCrLf & _
       "Теперь можно запускать CRM прямо с рабочего стола.", _
       vbInformation, "Skinvault CRM"
