npx ts-node push-layer.ts
cd image
docker build -t lambda-base-image .
cd ..
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 976210361945.dkr.ecr.eu-central-1.amazonaws.com
docker tag lambda-base-image:latest 976210361945.dkr.ecr.eu-central-1.amazonaws.com/lambda-base-image:latest
docker push 976210361945.dkr.ecr.eu-central-1.amazonaws.com/lambda-base-image:latest
echo "Done"
