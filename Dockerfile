FROM golang:1.18 as go-builder
WORKDIR /output-parser
COPY ./analyzer-output-parser/go.mod go.mod
COPY ./analyzer-output-parser/go.sum go.sum
COPY ./analyzer-output-parser/main.go main.go
RUN go build -o js-bundle-generator ./main.go

# NOTE: Since the `:latest` tag can have npm version changes, we are using
#       a specific version tag. Container build errors have come up locally
#       and via github action workflow when `:latest` is updated.
#
# Image info: https://catalog.redhat.com/software/containers/ubi9/nodejs-18/62e8e7ed22d1d3c2dfe2ca01
# Node 18 sufficient for Vite 6 (supports Node ^18.0.0 || ^20.0.0 || >=22.0.0)
# Relevant PRs:
#   - https://github.com/konveyor/tackle2-ui/pull/1746
#   - https://github.com/konveyor/tackle2-ui/pull/1781

# Builder image
FROM registry.access.redhat.com/ubi9/nodejs-18:1-88 as builder
USER 1001
COPY --chown=1001 . .
# Update assets
ARG VERSION=main
RUN sed -i "s,_VERSION_,${VERSION/main/latest},g" ./public/version.js
RUN npm clean-install && npm run build

FROM registry.access.redhat.com/ubi9/ubi-minimal

COPY --from=go-builder /output-parser/js-bundle-generator /usr/bin/js-bundle-generator
COPY --from=builder /opt/app-root/src/dist /usr/local/static-report

LABEL name="konveyor/static-report" \
      description="Konveyor Analysis - Static Report" \
      help="For more information visit https://konveyor.io" \
      license="Apache License 2.0" \
      summary="Static report for Konveyor analysis modules" \
      url="https://quay.io/konveyor/static-report"

ENTRYPOINT ["js-bundle-generator"]
