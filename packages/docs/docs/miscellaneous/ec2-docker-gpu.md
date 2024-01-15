---
image: /generated/articles-docs-miscellaneous-ec2-docker-gpu.png
title: Setup EC2 for Docker with GPU
sidebar_label: EC2 GPU with Docker
crumb: "FAQ"
---

Follow these Steps to setup EC2 GPU with Docker. Start with the instructions [here](https://www.remotion.dev/docs/miscellaneous/cloud-gpu), first.

## Setup EC2 for Docker with GPU

<Step>1</Step> Install NVIDIA container toolkit<br />

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list \
  && \
    sudo apt-get update
```

```bash
sudo apt-get install -y nvidia-container-toolkit
```

<Step>2</Step>Install Docker <br />

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

<Step>3</Step> Configure container runtime <br />

```bash
sudo nvidia-ctk runtime configure --runtime=docker
```

```bash
sudo systemctl restart docker
```

## Files

This makes use of https://github.com/UmungoBungo/remotion-gpu-test.git

It includes `entrypoint.sh`, which will run the render command and upload the output file to [transfer.sh](https://transfer.sh/). `entrypoint.sh` will need to co-located with the dockerfile on the instance.

## Dockerfile.example

```bash
FROM node:20-bookworm
RUN apt-get update
RUN apt-get install -y curl gnupg git chromium
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Clone the repo
RUN git clone https://github.com/remotion-dev/gpu-scene.git
WORKDIR /gpu-scene
RUN npm install

# Copy the entrypoint script into the image
COPY entrypoint.sh .

CMD ["sh", "./entrypoint.sh"]
```

## entrypoint.sh

```bash
#!/bin/bash

# Run the render-angle command
npx remotion render --gl=angle-egl Scene out/video.mp4

# Upload the file once rendering is finished
curl --upload-file ./out/video.mp4 https://transfer.sh/angle.mp4
```

## Run dockerfile

```bash
sudo docker build . -t remotion-docker-gpu
sudo docker run --gpus all --runtime=nvidia -e "NVIDIA_DRIVER_CAPABILITIES=all" remotion-docker-gpu
```
