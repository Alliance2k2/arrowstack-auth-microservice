# Lesson 2: JavaScript, Node.js, and npm

## Purpose
Run a small program before introducing server frameworks. Application code will use TypeScript later. These JavaScript files are isolated learning exercises, not the authentication implementation.

Node.js runs JavaScript outside the browser. npm runs project scripts and manages packages. TypeScript adds type checking to JavaScript; we will introduce it next. Express will later handle HTTP requests. None of these is a database.

## Files
- backend/package.json: project metadata and named commands. private prevents accidental npm publication; it does not control GitHub visibility. type: module enables import/export syntax in .js files.
- backend/learning/demo-user.js: exports a function returning sample data.
- backend/learning/02-basics.js: imports that function, calls it, and prints the results.

No third-party packages are installed. There is no server, API, password handling, or database yet.

## Translate from Python

| Python concept | JavaScript example | Meaning |
| --- | --- | --- |
| assignment | const user = ... | Bind a name; const prevents reassignment, but does not freeze an object |
| dictionary | { name: 'Alliance', role: 'USER' } | An object with named properties |
| function | function describeUser(user) { ... } | Reusable behavior |
| None | null | An explicit absent value |
| f-string | `${user.name} has the ${user.role} role.` | Template string, delimited by backticks |
| module import | import { findDemoUserById } from './demo-user.js' | Import a named export |

JavaScript uses braces for blocks. === compares without automatic type conversion. Object properties can be read with user.name. Return exits a function and provides its result.

## Understand async and await
An async function always returns a Promise, representing an eventual result or failure. await obtains its fulfilled value or throws its rejection. It does not block the whole Node process while waiting for asynchronous I/O.

Our sample function performs no real I/O; async is included to demonstrate the calling pattern a database operation will use later. Here await is at the top level, which is supported in an ES module. Inside a regular function, await requires making that function async.

## Trace the flow
1. Node loads the entry file and its imported module.
2. findDemoUserById receives a sample id.
3. It resolves to the matching sample object or null.
4. describeUser converts that result to a message.
5. console.log writes the message to the terminal.

This is local function flow, not an HTTP request. A future Express controller will receive a request and invoke a service in a similar sequence.

## Run it
From the internship workspace:

```powershell
Set-Location .\arrowstack-auth-microservice\backend
npm run lesson:basics
```

If your terminal is already in backend, run only the npm command.

Expected application output (npm also prints the script name):

```text
Alliance has the USER role.
No demonstration user found.
```

You do not need npm install for this lesson: Node provides everything this exercise uses.

## Security
This sample role is only data. It grants no permissions. Real roles must come from trusted backend state, and the server must enforce them. Never print real tokens, passwords, or password hashes with console.log.

## Three questions
1. What does Node do, and what does npm do?
2. Why does an unknown id return null instead of a user?
3. What does await give us when calling an async function?

## Your exercise
Change the sample name in demo-user.js to a name of your choice. Run the command again and explain why the first output changes while the second stays the same. Then add a department property to the sample object and include it in describeUser's message. Preserve the null check so missing users still work.

Next: review your output and questions, then introduce TypeScript and its compiler before Express.

Historical checkpoint: temporary scripts described above have been removed to keep the submission focused. Continue with 03-first-backend.md for current runnable code.
