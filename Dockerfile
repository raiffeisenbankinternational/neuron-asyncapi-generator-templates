FROM artifacts.rbi.tech/docker/node:16-alpine AS builder

WORKDIR /build

COPY neuron-crds /build/neuron-crds
COPY python-models /build/python-models

RUN npm config set registry https://artifacts.rbi.tech/artifactory/api/npm/npm-group && \
    (find . -maxdepth 1 -mindepth 1 -type d | while read dir; do \
      npm pack $dir; \
    done)

FROM artifacts.rbi.tech/docker/asyncapi/generator:1.9.5

COPY --from=builder /build/*.tgz /tmp/packages/

WORKDIR /app

# For some reason @asyncapi/generator's dev-dependencies want to be installed when running
# ag. This is a problem in github workflows as they can not reach registry.npmjs.org.
# Here we explicitly go into the global node module directory and install the dev-dependencies.
RUN npm config set registry https://artifacts.rbi.tech/artifactory/api/npm/npm-group && \
    cd /usr/local/lib/node_modules/@asyncapi/generator && \
    npm install && \
    cd /app && \
    npm install -g /tmp/packages/*.tgz --no-save
