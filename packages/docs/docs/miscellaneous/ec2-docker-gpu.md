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
FROM debian:bookworm-slim
RUN apt-get update && \
    apt-get install -y curl gnupg git chromium ffmpeg && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    # Enable Corepack
    corepack enable && \
    # Install linux dependencies
    # apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget libgbm-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Clone the repo
RUN git clone https://github.com/UmungoBungo/remotion-gpu-test.git
WORKDIR /remotion-gpu-test
RUN pnpm install

# Copy the entrypoint script into the image
COPY entrypoint.sh .

CMD ["./entrypoint.sh"]
```

## entrypoint.sh

```bash
#!/bin/bash

# Run the render-angle command
pnpm render-angle-egl

# Upload the file once rendering is finished
curl --upload-file ./out/angle.mp4 https://transfer.sh/angle.mp4
```

## Run dockerfile

```bash
sudo docker run --gpus all --runtime=nvidia -e "NVIDIA_DRIVER_CAPABILITIES=all" <docker-image-name>
```
