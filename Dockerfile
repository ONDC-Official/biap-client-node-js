# Name the node stage "builder"
FROM node:16 AS builder

ARG JUSPAY_SECRET_KEY_PATH
ARG JUSPAY_BASE_URL
ARG JUSPAY_MERCHANT_ID
ARG JUSPAY_API_KEY
ARG JUSPAY_WEBHOOK_USERNAME
ARG JUSPAY_WEBHOOK_PASSWORD

ARG FIREBASE_ADMIN_SERVICE_ACCOUNT

ARG ONDC_BASE_API_URL
ARG PORT

ENV JUSPAY_SECRET_KEY_PATH ${JUSPAY_SECRET_KEY_PATH}
ENV JUSPAY_BASE_URL ${JUSPAY_BASE_URL}
ENV JUSPAY_MERCHANT_ID ${JUSPAY_MERCHANT_ID}
ENV JUSPAY_API_KEY ${JUSPAY_API_KEY}
ENV JUSPAY_WEBHOOK_USERNAME ${JUSPAY_WEBHOOK_USERNAME}
ENV JUSPAY_WEBHOOK_PASSWORD ${JUSPAY_WEBHOOK_PASSWORD}

ENV FIREBASE_ADMIN_SERVICE_ACCOUNT ${FIREBASE_ADMIN_SERVICE_ACCOUNT}

ENV ONDC_BASE_API_URL ${ONDC_BASE_API_URL}
ENV PORT ${PORT}

# Set working directory
WORKDIR /build
COPY package*.json yarn.lock ./

# install node modules
RUN yarn

# Copy all files from current directory to working dir in image
COPY . .
CMD [ "yarn", "start" ]
