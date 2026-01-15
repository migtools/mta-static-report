FROM registry.redhat.io/ubi9/go-toolset:1.23 AS go-builder
COPY --chown=1001:0 . /workspace
WORKDIR /workspace/analyzer-output-parser

ENV GOEXPERIMENT strictfipsruntime
RUN CGO_ENABLED=1 go build -tags strictfipsruntime -o js-bundle-generator ./main.go

FROM registry.redhat.io/ubi9/nodejs-18:latest AS nodejs-builder
COPY --chown=1001:0 . /workspace
USER 1001
WORKDIR /workspace

# Replace upstream assets with mta
COPY ./hack/build/static-report-assets/logo.svg src/images/logo.svg
COPY ./hack/build/static-report-assets/navbar-logo.svg src/images/navbar-logo.svg
COPY ./hack/build/static-report-assets/favicon.ico public/favicon.ico
RUN sed -i "s/_VERSION_/${BUILD_VERSION}/g" public/version.js
RUN sed -i -e 's/\(name: "\)[^"]*"/\1Migration Toolkit for Applications"/' \
    -e 's/\(websiteURL: "\)[^"]*"/\1https:\/\/developers.redhat.com\/products\/mta\/overview"/' \
    -e 's/\(documentationURL: "\)[^"]*"/\1https:\/\/access.redhat.com\/documentation\/en-us\/migration_toolkit_for_applications"/' \
    src/layout/theme-constants.ts
RUN npm clean-install --no-audit --verbose && CI=true PUBLIC_URL=. npm run build

FROM registry.redhat.io/ubi9:latest
RUN dnf -y install openssl && dnf -y clean all

COPY --from=go-builder /workspace/analyzer-output-parser/js-bundle-generator /usr/bin/js-bundle-generator
COPY --from=nodejs-builder /workspace/build /usr/local/static-report
COPY --from=nodejs-builder /workspace/LICENSE /licenses/

ENTRYPOINT ["js-bundle-generator"]

LABEL \
        description="Migration Toolkit for Applications - Static Report" \
        io.k8s.description="Migration Toolkit for Applications - Static Report" \
        io.k8s.display-name="MTA - Static Report" \
        io.openshift.maintainer.project="MTA" \
        io.openshift.tags="migration,modernization,mta,tackle,konveyor" \
        summary="Migration Toolkit for Applications - Static Report"
