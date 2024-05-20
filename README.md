# Introduction
VaahShare Introduction

## Setup

- Clone the repository
```bash
git clone https://github.com/webreinvent/vaahshare.git
```
- Now clone the API repository and follow the setup guide provided in the API repository
```bash
git clone https://github.com/webreinvent/vaah-sockets.git
```
- Run npm install in both repositories.
- In the VaahShare repository, edit the environment file as follows:
  
| Key | Description | Value |
| ------------- | -------- | ------------- |
| VITE_APP_ENV  | VaahShare App Environment | development/production |
| VITE_API_URL  | VaahShare API URL or Backend URL | http://localhost/himanshu/vaahshare-backend/public/api/

## Runnning the app
- Run npm run dev to start the app.
- The app is currently locked to a single instance, so you can only run one instance at a time.
- To run multiple instances with different hosts, use `npm run dev-electron`.
- This will start the app with a different host:  **electron**, allowing you to run multiple instances on a single machine.

## Build the app
- Before building the app, ensure you have updated the environment file with the correct `VITE_API_URL` and `VITE_APP_ENV` set to production.
- Run `npm run build` to build the app.
 -After that, the installer and unpacked build will be available in the `dist` folder.
