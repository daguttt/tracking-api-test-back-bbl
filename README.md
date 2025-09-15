# Tracking API - BBL Backend Technical Test

## Project Overview

This project is a technical test that...

The project is built on Cloudflare Workers for serverless compute and uses Cloudflare D1 for as database storage. The API is designed for robust, scalable, keeping low-latency.


## Deployed version

Deployed version available: https://tracking-api-test-back-bbl.daguttt.workers.dev/api/v1/

## Local Development Setup

### Prerequisites
- Node.js (version specified in [.nvmrc](./.nvmrc))
    - Install it using [fnm](https://github.com/Schniz/fnm) (*Recommended*)
- Package Manager: [pnpm](https://pnpm.io/es/installation)
    - Check out **_why_** and how to install it [here](https://gist.github.com/daguttt/89adeb45ef3cf6483c394e135ce6e9ec)

### Running the project
#### 1. Clone the repo
```bash
git clone https://github.com/daguttt/mini-chat-technical-test.git
```

#### 2. Install dependencies.
```bash
pnpm i
```

#### 3. Environment variables.
1. Copy the [example file](./.env.example).
```bash
cp .env.example .env
```
    
2. Modify environment variables. 
    - `LOGGING_LEVEL`: set your desired logging level (`"debug" | "info" | "warn" | "error"`). Default is `"debug"`.

    Ask the project owner for the following variables:
    - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
    - `CLOUDFLARE_DATABASE_ID`: Cloudflare D1 database ID.
    - `CLOUDFLARE_D1_TOKEN`: Cloudflare D1 token.
   

#### 4. Cloudflare Setup
Create the local D1 (SQLite) database:
```bash
pnpm db:create:dev
```

> [!NOTE]
> The script will use `wrangler d1 migrations apply` in order to apply the migrations. **Make sure to allow the migrations to run (Hit `y` when prompted)**


#### 5. Run the development server
```bash
pnpm dev
```

Seed the database (Only the first time you set up the project)
```bash
pnpm db:seed:dev
```


