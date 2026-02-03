# TODO: Cannot execute `npx remotion render HelloWorld --browser-executable=$(which chromium)` yet, because it misses libstdc++.so.6
FROM nixos/nix

RUN mkdir -p /etc/profile.d
RUN echo 'set -eux; nix-channel --update' > /etc/profile.d/nix.sh

WORKDIR /usr/app

RUN nix-env -iA nixpkgs.nodejs-18_x
RUN nix-env -iA nixpkgs.ungoogled-chromium

RUN npm i -g @remotion/cli

COPY remotion.nix .

# Copy the pre-built bundle
COPY bundle/ /usr/app/bundle/

RUN chmod +x /root/.npm/_npx/*/node_modules/@remotion/compositor-linux-arm64-gnu/remotion || true
RUN nix run nixpkgs#patchelf --extra-experimental-features nix-command --extra-experimental-features flakes -- --set-interpreter "$(nix eval nixpkgs#stdenv.cc.bintools.dynamicLinker --raw --extra-experimental-features nix-command --extra-experimental-features flakes)" /root/.npm/_npx/*/node_modules/@remotion/compositor-linux-arm64-gnu/remotion || true
RUN nix run nixpkgs#patchelf --extra-experimental-features nix-command --extra-experimental-features flakes -- --set-interpreter "$(nix eval nixpkgs#stdenv.cc.bintools.dynamicLinker --raw --extra-experimental-features nix-command --extra-experimental-features flakes)" /root/.npm/_npx/*/node_modules/@remotion/compositor-linux-arm64-gnu/ffmpeg || true
RUN nix run nixpkgs#patchelf --extra-experimental-features nix-command --extra-experimental-features flakes -- --set-interpreter "$(nix eval nixpkgs#stdenv.cc.bintools.dynamicLinker --raw --extra-experimental-features nix-command --extra-experimental-features flakes)" /root/.npm/_npx/*/node_modules/@remotion/compositor-linux-arm64-gnu/ffprobe || true

RUN npx remotion compositions /usr/app/bundle --browser-executable=$(which chromium)
RUN npx remotion render /usr/app/bundle browser-test --browser-executable=$(which chromium) /usr/app/out.mp4
