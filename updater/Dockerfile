FROM alpine:3.19

RUN apk add --no-cache \
    curl \
    jq \
    docker-cli

COPY check-update.sh /check-update.sh
RUN chmod +x /check-update.sh

# Run check every hour
RUN echo "0 * * * * /check-update.sh >> /proc/1/fd/1 2>&1" > /etc/crontabs/root

CMD ["crond", "-f", "-l", "2"]
