---
description: Use when implementing a new feature or making a significant change to an existing module. Creates an implementation plan, waits for approval, implements the change, runs tests, and summarizes tradeoffs.
---

# Implement Feature

Use this workflow when implementing a non-trivial feature or module change.

## Steps

1. Read the active Rules relevant to the task.

2. Inspect the existing code before proposing changes.

3. Identify the smallest reasonable scope for the task.

4. Create an implementation plan before editing code.

   The plan must include:
   - files to create
   - files to modify
   - behavior changes
   - tests to add or update
   - tradeoffs or assumptions

5. Wait for user approval before making significant changes.

6. Implement the approved plan.

7. Run relevant tests when possible.

8. Summarize the result.

   Include:
   - what changed
   - why the design was chosen
   - missing-file or error handling if relevant
   - tests run
   - tests not run, if any