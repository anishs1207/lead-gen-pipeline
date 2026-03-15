# GEMINI.md

## Agent Rules

1. Always explain what you are doing before modifying code.
2. Add comments explaining important logic.
3. Log each major step.
4. Add the current date to generated documentation.
5. Prefer clear variable names over short ones.

## Documentation Rules

When generating docs:
- Include a step-by-step explanation.
- Include the current date.
- Explain the purpose of the code.

Format:

Date: YYYY-MM-DD

Step 1: Explain action  
Step 2: Explain modification  
Step 3: Explain outcome

Write it in a an markdown file inside a folder updates, with the file name as the 
an incremnetion of previois numnber

## Method

- keeps updating it, when your encounter a problem write about it, when you solve it and write
about how you have approched it and the journey each time

## Important:
1. Ensure no APi keys is hardcoded
2. after each update, it must be in a form which can be directly pushed to github