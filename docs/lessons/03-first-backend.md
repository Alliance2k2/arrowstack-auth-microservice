# Lesson 3: The first real backend endpoint

## What changed
The backend now serves one HTTP endpoint. Temporary learning scripts and empty placeholder folders were removed. Application source uses TypeScript. No database or authentication exists yet.

## Understand the tools
Node executes JavaScript. TypeScript checks types and compiles .ts source into .js output. npm runs commands from package.json. Express maps HTTP methods and paths to functions. The lockfile records exact dependency resolutions; commit it. Never commit node_modules or generated dist files.

Installed: Express 5.3.0 and TypeScript 7.0.2, with Express 5 and Node 24 type definitions. These were resolved from npm, not guessed. Type packages provide compiler information, not another web server. Strict mode helps catch mistakes early. NodeNext models Node's ES modules. Imports use .js because compiled files run as JavaScript; TypeScript resolves that import to the corresponding .ts source during compilation.

## Read app.ts
express() creates the application. app.get registers a GET handler. The path is /api/v1/health. The handler receives a request and response; _request names an unused argument. status(200) means success. json serializes the object and sets the JSON content type. This health check proves the HTTP process responds, not that a database is ready.

## Read server.ts
Importing app separates request handling from starting a network listener. Tests can later use the app without opening the production port. PORT is a string from the environment, so Number converts it. We reject invalid ports instead of silently using a bad configuration. listen binds to local loopback. Signal handlers close the server when it stops, with a time limit.

## Request flow
Browser GET -> local port 3000 -> Express matches route -> handler sends HTTP 200 and JSON -> browser displays JSON. No database query occurs.

## Run and verify
From backend:

```powershell
npm run typecheck
npm run build
npm start
```

In a second terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/v1/health
```

Stop the server with Ctrl+C. See README for installation commands. Compilation is a check, not a substitute for HTTP or security testing.

## Security
Loopback binding limits this development server to the local machine. No tokens, passwords, or user data are returned. Authentication middleware, input validation, rate limits, and other protections will be added before protected functionality. This service is not deployment-ready.

## Three questions
1. Why keep app.ts separate from server.ts?
2. What is the difference between npm run build and npm start?
3. Does a successful health response prove PostgreSQL is connected? Why?

## Exercise
Add a version string to the health JSON, rebuild, restart, and inspect the result. Explain why editing TypeScript without rebuilding does not change npm start's output. Avoid exposing environment variables or secrets.
