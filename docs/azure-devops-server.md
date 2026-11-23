# Azure DevOps Server setup

This guide covers the repository's Azure DevOps Server 2020 Update 1.2 configuration. The root
`azure-pipelines-*.yml` files are for Azure Pipelines cloud. Server-specific definitions live in
`.azuredevops/server/` because they use the self-hosted `Default` agent pool and Server-compatible
build artifact publishing.

## Pipelines

| Pipeline                         | YAML path                                            | Purpose                                                                                                              |
| -------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Playwright - PR Smoke Validation | `.azuredevops/server/azure-pipelines-pr.yml`         | Required Chromium smoke validation for pull requests targeting `main`, plus lint, formatting, and TypeScript checks. |
| Playwright - Regression and E2E  | `.azuredevops/server/azure-pipelines-regression.yml` | Scheduled nightly regression and E2E in Chromium and Microsoft Edge; can also be run manually.                       |
| Playwright - Manual UI Tests     | `.azuredevops/server/azure-pipelines-manual.yml`     | Manually choose environment, browser, and suite.                                                                     |

The `main` branch should retain its required Build Validation policy for the PR smoke pipeline.
The agent in the `Default` pool must be online while a job is queued. The agent runs on the local
Windows machine and accesses only the approved local demo application for the current configuration.

## Register or update a pipeline

In Azure DevOps Server, open **Pipelines → Pipelines**, then create a pipeline from **Azure Repos
Git** and select this repository. Choose **Existing Azure Pipelines YAML file**, branch `main`, and
the matching YAML path in the table. If a pipeline already exists, edit its YAML path after the
new files have reached `main`. Keep the required Build Validation policy associated with the PR
smoke pipeline when updating its definition.

For a manual run, choose:

- **Environment:** `local`, `qa`, `staging`, or `uat`
- **Browser:** `Chromium`, `Microsoft Edge`, or `All browsers`
- **Suite:** `Smoke`, `Sanity`, `Regression`, `End-to-end`, or `All suites`

The local Leap & Leash demo is configured and verified without credentials. QA, staging, and UAT
require an approved `BASE_URL`, its exact hostname in `ALLOWED_BASE_URL_HOSTS`, a matching
`playwright-qa`, `playwright-staging`, or `playwright-uat` variable group, and a corresponding
`test-data/<environment>.json` dataset. Do not select an environment until those values and data
are provisioned. Production targets, personal credentials, sign-in, and real transactions are not
used.

## Start the local agent

For interactive execution, open PowerShell and run:

```powershell
Set-Location C:\azagent
.\run.cmd
```

Keep the process running while pipeline jobs are expected. For unattended startup, configure the
agent as a Windows service using the Azure agent's documented configuration. Do not run the same
agent interactively and as a service at the same time. The computer must remain powered on, awake,
and connected to Azure DevOps Server.

## Results and artifacts

JUnit results appear in the pipeline **Tests** tab. Download the published artifact from the run
to inspect its HTML report and `test-results` diagnostics. Artifact names are
`pr-validation-diagnostics`, `scheduled-regression-diagnostics`, and `manual-run-diagnostics` for
the PR, regression, and manual pipelines. Failure screenshots, videos, and traces follow the
Playwright retention configuration.

## Repository synchronization

GitHub `main` is the intended source of truth. Azure Repos is a separate remote and does not
synchronize automatically. The planned flow is one-way from GitHub `main` to an Azure Repos
integration branch, followed by an Azure pull request into protected `main`. Do not force-push or
directly overwrite Azure `main`; its required PR validation remains the merge gate. The sync job
must run on the local Azure agent to reach this on-premises Server, and its Azure build identity
must receive only the permissions needed to create/update the integration branch and open a PR.
Synchronization is not enabled by this document alone.
