# Tracking API - BBL Backend Technical Test

## Project Overview

This project is a technical test that...

The project is built on Cloudflare Workers for serverless compute and uses Cloudflare D1 for as database storage. The API is designed for robust, scalable, keeping low-latency.


## Deployed version

Deployed version available: https://tracking-api-test-back-bbl.daguttt.workers.dev/api/

## Local Development Setup

### Prerequisites
- Node.js (version specified in [.nvmrc](./.nvmrc))
    - Install it using [fnm](https://github.com/Schniz/fnm) (*Recommended*)
- Package Manager: [pnpm](https://pnpm.io/es/installation)
    - Check out **_why_** and how to install it [here](https://gist.github.com/daguttt/89adeb45ef3cf6483c394e135ce6e9ec)
- Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages)

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
    
2. Modify the environment variables:
    - `LOGGING_LEVEL`: set your desired logging level (`"debug" | "info" | "warn" | "error"`). Default is `"debug"`.
    - `ENVIRONMENT`: Possible values are `"development" | "production"`. Default is `"development"`.

    The variables below can be asked to the project owner:
    - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
    - `CLOUDFLARE_DATABASE_ID`: Cloudflare D1 database ID.
    - `CLOUDFLARE_D1_TOKEN`: Cloudflare D1 token.

   

#### 4. Cloudflare set up
Create the local D1 database running the dev command (only meant to create the DB, not to run the dev server)
```bash
pnpm dev
```

Then, after the database is created inside the `.wrangler/d1` folder, you can push the DB schema

```bash
pnpm db:push:dev # Local DB
```

#### 5. Run the development server
```bash
pnpm dev
```

