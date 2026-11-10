# Lesson 1: Understand the structure

## What we created and why
Only folders and design documents. They give each responsibility a clear home before application code exists. Empty folders contain .gitkeep because Git tracks files, not empty directories.

Frontend means code running in a browser. Backend means the server accepting requests and enforcing rules. Database means persistent structured storage. Your Python background transfers to backend functions, modules, exceptions, and data modeling; HTTP adds communication between separate programs.

Read architecture.md for the request-flow diagram, requirements.md for acceptance goals, and learning-guide.md for the sequence. There are no application functions to inspect yet.

## Inspect it yourself
From the internship workspace in PowerShell:

```powershell
Set-Location .\arrowstack-auth-microservice
Get-ChildItem
Get-Content .\docs\architecture.md
tree /F
```

These commands inspect files. They do not start an application. No dependency installation is needed for this lesson.

## Security idea
Browser code is visible to users and can be bypassed. The backend must check permissions, and secrets must remain outside source control. A hidden admin button cannot protect an admin endpoint.

## Three questions
1. Why must the backend check the role even when React hides admin links?
2. What is the difference between an Express route and a PostgreSQL table?
3. Why should login rules live in a service instead of being copied into several routes?

## Your exercise
Create docs/lessons/my-architecture-notes.md. In your own words, describe the six-step login flow from architecture.md and identify which step talks to PostgreSQL. Add one question you still have. Do not include real passwords or tokens.

Next checkpoint: JavaScript/TypeScript foundations and backend initialization, followed by one health endpoint. No authentication feature is generated before its concepts are explained.
