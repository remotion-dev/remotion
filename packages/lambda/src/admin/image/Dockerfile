# Define custom function directory
ARG FUNCTION_DIR="/function"

FROM node:14-alpine

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Install aws-lambda-cpp build dependencies
RUN apk add --no-cache \
    g++ \
    make \
    cmake \
    unzip \
    curl-dev \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ffmpeg \
    # Needed for AWS interface
    autoconf \
    automake \
    libtool \
    libexecinfo-dev	\
    python3

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY app.js ${FUNCTION_DIR}/app.js
COPY package.json package.json

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

# If the dependency is not in package.json uncomment the following line
RUN npm install aws-lambda-ric

ENTRYPOINT ["npx", "aws-lambda-ric"]
CMD ["app.handler"]
