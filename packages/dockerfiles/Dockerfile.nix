# TODO: Cannot execute `npx remotion render HelloWorld --browser-executable=$(which chromium)` yet, because it misses libstdc++.so.6 
FROM nixos/nix

RUN mkdir -p /etc/profile.d
RUN echo 'set -eux; nix-channel --update' > /etc/profile.d/nix.sh

WORKDIR /usr/app

RUN git clone https://github.com/remotion-dev/template-helloworld /usr/app
RUN cd /usr/app


RUN nix-env -iA nixpkgs.nodejs-18_x
RUN nix-env -iA nixpkgs.ungoogled-chromium

RUN npm i

COPY remotion.nix .

RUN chmod +x /usr/app/node_modules/@remotion/compositor-linux-arm64-gnu/remotion
RUN nix run nixpkgs#patchelf --extra-experimental-features nix-command --extra-experimental-features flakes -- --set-interpreter "$(nix eval nixpkgs#stdenv.cc.bintools.dynamicLinker --raw --extra-experimental-features nix-command --extra-experimental-features flakes)" /usr/app/node_modules/@remotion/compositor-linux-arm64-gnu/remotion
RUN nix run nixpkgs#patchelf --extra-experimental-features nix-command --extra-experimental-features flakes -- --set-interpreter "$(nix eval nixpkgs#stdenv.cc.bintools.dynamicLinker --raw --extra-experimental-features nix-command --extra-experimental-features flakes)" /usr/app/node_modules/@remotion/compositor-linux-arm64-gnu/ffmpeg
RUN nix run nixpkgs#patchelf --extra-experimental-features nix-command --extra-experimental-features flakes -- --set-interpreter "$(nix eval nixpkgs#stdenv.cc.bintools.dynamicLinker --raw --extra-experimental-features nix-command --extra-experimental-features flakes)" /usr/app/node_modules/@remotion/compositor-linux-arm64-gnu/ffprobe
RUN npx remotion render HelloWorld --browser-executable=$(which chromium) 
