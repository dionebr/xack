$ErrorActionPreference = "Stop"
try {
    Write-Host "Connecting to 10.13.37.124:8888..."
    $client = New-Object System.Net.Sockets.TcpClient("10.13.37.124", 8888)
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream)
    
    # Read all output
    $output = $reader.ReadToEnd()
    Write-Host "Raw Output:" -ForegroundColor Gray
    Write-Host $output

    # Close connection
    $client.Close()

    # Parse Flag
    if ($output -match "DEBUG: (.*)") {
        $encodedFlag = $matches[1].Trim()
        Write-Host "`nFound Encoded Flag: $encodedFlag" -ForegroundColor Yellow
        
        # Decode
        $flagBytes = [System.Convert]::FromBase64String($encodedFlag)
        $flag = [System.Text.Encoding]::UTF8.GetString($flagBytes)
        
        Write-Host "`n[+] FLAG CAPTURED: $flag" -ForegroundColor Green
    }
    else {
        Write-Host "Flag pattern not found in output." -ForegroundColor Red
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
