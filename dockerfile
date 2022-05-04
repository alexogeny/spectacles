FROM debian:latest as zola-base

RUN apt-get update && apt-get install -y wget

RUN wget -c https://github.com/getzola/zola/releases/download/v0.15.3/zola-v0.15.3-x86_64-unknown-linux-gnu.tar.gz -O - | tar -xz

RUN mv zola /usr/bin

RUN mkdir /site

WORKDIR /site

FROM zola-base as builder

COPY . /site

RUN zola build

FROM nginx:stable-alpine

RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/old-index.html

COPY --from=builder /site/public/ /usr/share/nginx/html/

EXPOSE 1111
EXPOSE 80
