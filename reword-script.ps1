(Get-Content $args[0]) -replace '^first commit', 'Inisialisasi proyek MindQuest' -replace '(?i)^fix:\s*', '' -replace '(?i)^docs:\s*', '' | Set-Content $args[0]
