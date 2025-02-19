---
image: /generated/articles-docs-miscellaneous-cloud-gpu-docker.png
title: Setup EC2 for Docker with GPU
sidebar_label: GPU in the cloud (Docker)
crumb: 'FAQ'
---

:::note
The guide is outdated and will not work anymore.  
As of now, the [bare GPU guide](/docs/miscellaneous/cloud-gpu) is up to date.
:::

Follow these steps closely to render videos on EC2 in a Docker container.  
These steps are opinionated, but specify a reference that works.

A word of warning: Deviating from the instructions, like:

- choosing a different AMI
- choosing a different Docker base
- choosing something else than EC2
- choosing a different host machine

may lead to the GPU not working. In this case, it is hard to debug.  
We recommend to first follow these instructions and make changes once you have a working setup.

## Setup EC2 for Docker with GPU

<Step>1</Step> Follow the instructions for <a href="/docs/miscellaneous/cloud-gpu">GPUs on EC2</a>. You can skip installing Chrome, Node.js and cloning the repo to render a video.

<Step>2</Step> Install NVIDIA Container toolkit:

```bash title="Add keyring"
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
```

```bash title="Install toolkit"
sudo apt-get install -y nvidia-container-toolkit
```

<Step>3</Step>Install Docker: <br />

```bash title="Add Docker's official GPG key"
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

```bash title="Add keyring"
echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

```bash title="Install Docker"
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

<Step>4</Step>Configure Docker to use the NVIDIA runtime <br />

```bash title="Configure the NVIDIA container runtime"
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

<Step>5</Step> Create two files, <code>Dockerfile</code> and <code>entrypoint.sh</code>. You can for example create them using the <code>nano ./file-to-create</code> command. Use <kbd>Ctrl</kbd>
<kbd>X</kbd> to save and quit. <br />

```bash title="Dockerfile"
FROM node:20-bookworm
RUN apt-get update
RUN apt-get install -y curl gnupg git
RUN rm -rf /var/lib/apt/lists/*

# Clone the repo
RUN git clone https://github.com/remotion-dev/gpu-scene.git
WORKDIR /gpu-scene
RUN npm install

# Copy the entrypoint script into the image
COPY entrypoint.sh .

CMD ["sh", "./entrypoint.sh"]
```

```bash title="entrypoint.sh"
#!/bin/bash

npx remotion render --gl=angle-egl Scene out/video.mp4
```

<Step>6</Step> Build the container and run a sample render: <br />

```bash
sudo docker build . -t remotion-docker-gpu
sudo docker run --gpus all --runtime=nvidia -e "NVIDIA_DRIVER_CAPABILITIES=all" remotion-docker-gpu
```

## Debugging

Use the [`npx remotion gpu`](/docs/cli/gpu) command to get the output of `chrome://gpu` to verify that the GPU is working.

## See also

- [GPUs on EC2](/docs/miscellaneous/cloud-gpu)
- [Using the GPU](/docs/gpu)

<Credits
  contributors={[
    {
      username: 'UmungoBungo',
      contribution: 'Workflow author',
    },
    {
      username: 'kaf-lamed-beyt',
      contribution: 'Writeup',
    },
  ]}
/>
