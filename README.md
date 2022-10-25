# Introduction
A node js rest api server which sits between ONDC protocol layer and react app in browser

# For whom
anyone who want to refer for building a UI friendly API on protocol layer

# Server side Events(SSE)
- Since each request response is async in ONDC, when we receive data from protocol layer we communicate it to browser as soon as possible with SSE
- Opens the connection at the time of first response from protocol layer that needs to be communicated to browser

# Build with nodejs
- using express js
- Implements referral implementation of payment integration with Juspay

# To run locally
```
yarn add or npm install
yarn debug or npm debug
```

# To build
```
yarn add or npm install
yarn start or npm start
```


