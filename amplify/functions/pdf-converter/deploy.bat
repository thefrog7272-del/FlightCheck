@echo off
setlocal

set REGION=eu-west-2
set STACK=flightcheck-pdf-converter

echo.
echo === FlightCheck PDF Converter — Deploy ===
echo Region: %REGION%
echo Stack:  %STACK%
echo.

where sam >nul 2>&1
if errorlevel 1 (
    echo ERROR: AWS SAM CLI not found.
    echo Install it from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
    exit /b 1
)

where aws >nul 2>&1
if errorlevel 1 (
    echo ERROR: AWS CLI not found.
    echo Install it from: https://aws.amazon.com/cli/
    exit /b 1
)

echo Building Lambda package ^(installing pdfplumber...^)
sam build --template-file template.yaml
if errorlevel 1 ( echo Build failed. & exit /b 1 )

echo.
echo Deploying to AWS...
sam deploy ^
  --template-file .aws-sam\build\template.yaml ^
  --stack-name %STACK% ^
  --region %REGION% ^
  --capabilities CAPABILITY_IAM ^
  --resolve-s3 ^
  --no-confirm-changeset
if errorlevel 1 ( echo Deploy failed. & exit /b 1 )

echo.
echo === Deployment complete! ===
echo.
echo Your Lambda Function URL:
aws cloudformation describe-stacks ^
  --stack-name %STACK% ^
  --region %REGION% ^
  --query "Stacks[0].Outputs[?OutputKey=='FunctionUrl'].OutputValue" ^
  --output text

echo.
echo Next steps:
echo   1. Copy the URL above
echo   2. In Amplify Console ^> your app ^> Environment variables
echo   3. Add:  VITE_PDF_CONVERTER_URL = ^<the URL^>
echo   4. Redeploy the app (or push a commit to main)
echo.
