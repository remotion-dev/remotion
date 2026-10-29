FROM node:17.3.0-alpine3.13

RUN mkdir -p app
COPY Cargo.toml app/Cargo.toml
COPY Cargo.lock app/Cargo.lock
COPY *.mjs app/
COPY test-remotion-shm.py app/test-remotion-shm.py
COPY *.rs app/
COPY libmp3lame.zip app/libmp3lame.zip
COPY vpx.gz app/vpx.gz
COPY opus.gz app/opus.gz
COPY sample-5s.webm app/sample-5s.webm
COPY sample.mp4 app/sample.mp4
COPY sample-av1.webm app/sample-av1.webm
COPY *.patch app/

RUN apk add curl
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
RUN source "$HOME/.cargo/env"
RUN apk add yasm nasm curl git make ca-certificates pkgconfig bash cmake make cmake build-base llvm-static llvm-dev clang-static clang-dev perl zlib zlib-dev meson ninja autoconf automake libtool patchelf
RUN cd app && CFLAGS="$CFLAGS -static-libgcc" CXXFLAGS="$CXXFLAGS -static-libgcc -static-libstdc++" LDFLAGS="$LDFLAGS -static-libgcc -static-libstdc++" node compile-ffmpeg.mjs musl old-cmake
RUN source "$HOME/.cargo/env" && cd app && node generate-bindings.mjs musl
RUN source "$HOME/.cargo/env" && cd app && node zip.mjs
RUN source "$HOME/.cargo/env" && cd app && node test-ffmpeg.mjs
