# Security Policy

## Reporting a vulnerability

If you discover a security issue, please **do not open a public issue**.
Instead, report it privately by emailing the maintainer or using GitHub's
"Report a vulnerability" feature under the Security tab.

Please include:
- A description of the issue and its impact
- Steps to reproduce
- Any relevant logs or proof of concept

You can expect an acknowledgement within a few days.

## Handling of sensitive data

- Passwords are hashed with bcrypt and never returned in API responses.
- Authentication uses signed JWTs; keep your `JWT_SECRET` private.
- Credential endpoints are rate-limited to slow brute-force attempts.
- Never commit `.env` files — use the provided `.env.example` templates.

## Supported versions

This is an actively developed project; fixes land on `main`.
