# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2] -replace '^"(.+)"$', '$1'
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

# Run the test
node tests/test-live-sync.mjs
