
## How to Use

1. Clone the repository

2. Install the dependencies

```bash
pnpm install
```

3. Create the CDK stack

```bash
pnpx aws-cdk deploy \
  --outputs-file ./cdk-outputs.json
```

4. Open the AWS Console and find the lambda 
  
5. Cleanup

```bash
pnpx exec aws-cdk destroy
```
