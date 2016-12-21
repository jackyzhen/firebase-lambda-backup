# firebase-lambda-backup
An aws lambda that does periodic backups of firebase

## Usage

Setup a lambda in aws console with env variables:
```
S3_REGION
S3_BUCKET
FIREBASE_URL
FIREBASE_TOKEN
```

`FIREBASE_TOKEN` is setup by default to be encrypted using KMS.

You can setup a aws cloudwatch rule to run this lambda on a schedule.

## Build and Deploy

You can upload the code manually or use the provided make file to build a zip and upload.

`npm run deploy` for example (you need specify your lambda function name).
