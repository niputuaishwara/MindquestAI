(Get-Content $args[0]) -replace '^pick', 'reword' | Set-Content $args[0]
