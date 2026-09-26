# TC-47 — T-23: the start-up guard, and /dev in the production build

Executed 2026-09-26 (shell, see startup-guard.log) · build under test 762f093 (repository HEAD c7e3524; no source change since) · result **PASS**

| Check | Result | Observed |
|---|---|---|
| local stand-ins on https://portal.bow.example refused | pass | exit 1, "Stand-ins may only run on localhost or 127.0.0.1" |
| PORTAL_MODE=production with stand-ins refused | pass | exit 1 |
| a single stand-in (email) on a public address refused | pass | exit 1, names EMAIL_ADAPTER=local |
| real sign-in with the local database refused | pass | exit 1 |
| 0.0.0.0 as the public address refused | pass | exit 1 |
| localhost.bow.example (look-alike host) refused | pass | exit 1 |
| adapter value typo ("Local") refused | pass | exit 1 |
| control: a correct local configuration starts and answers | pass | GET /api/session 200, then stopped by the 20 s alarm (exit 142) |
| the production server bundle refuses to run with stand-ins | pass | exit 1, "this is a production build, and it has no local stand-ins" |
| the production server bundle carries no /dev routes | pass | 0 matches for dev/api/sign-in, DevController, api/people in apps/server/dist/main.js |

## Notes

- The production web bundle contains one reference to `/dev/sign-in`: the sign-in page's link to it. The page itself is not in the server bundle, so the link would lead to "not found". Real sign-in (Entra ID) is Stage 2 and not built; recorded as an observation, not a defect.
- The requests to `/dev/sign-in` on a running production build could not be made: the production bundle refuses to start at all in Stage 1 (it has no real adapters), which is the stronger outcome.
