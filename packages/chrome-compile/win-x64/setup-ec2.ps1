# setup-ec2.ps1 - Run over SSH on the Windows build host after copying the
# inputs to C:\chrome-build. Starts build-chromium.ps1 as a scheduled task so
# the multi-hour build survives the SSH session, and logs to
# C:\chrome-build\build.log.
$ErrorActionPreference = 'Stop'
$root = 'C:\chrome-build'

foreach ($file in 'args.gn', 'build-chromium.ps1', 'remotion-shared-memory-v3.patch', 'probe-fast-path.py') {
  if (-not (Test-Path (Join-Path $root $file))) {
    throw "Missing required input: $root\$file"
  }
}
Get-FileHash -Algorithm SHA256 (Join-Path $root 'remotion-shared-memory-v3.patch'), (Join-Path $root 'build-chromium.ps1') |
  ForEach-Object { "{0}  {1}" -f $_.Hash.ToLower(), (Split-Path -Leaf $_.Path) }

if (Get-ScheduledTask -TaskName RemotionChromiumBuild -ErrorAction SilentlyContinue) {
  $state = (Get-ScheduledTask -TaskName RemotionChromiumBuild).State
  if ($state -eq 'Running') {
    throw 'A build is already running (scheduled task RemotionChromiumBuild).'
  }
  Unregister-ScheduledTask -TaskName RemotionChromiumBuild -Confirm:$false
}

if (Test-Path "$root\build.log") {
  Move-Item "$root\build.log" ("$root\build-{0}.log" -f [DateTimeOffset]::UtcNow.ToUnixTimeSeconds())
}

# cmd.exe redirection captures native stderr (git progress, ninja) as well.
$command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File $root\build-chromium.ps1 > $root\build.log 2>&1"
$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"$command`"" -WorkingDirectory $root
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName RemotionChromiumBuild -Action $action -Settings $settings -Principal $principal | Out-Null
Start-ScheduledTask -TaskName RemotionChromiumBuild
Start-Sleep -Seconds 5
$task = Get-ScheduledTask -TaskName RemotionChromiumBuild
"Scheduled task RemotionChromiumBuild is $($task.State). Log: $root\build.log"
