# Security Policy for Cyber PolCo

Thank you for helping keep Cyber PolCo secure. This document explains how to report security vulnerabilities, what to expect from our team, and our disclosure policy.

## Reporting a Vulnerability

Preferred channels (in order):
1. GitHub Security Advisories: https://github.com/alphonsekazadi/cyberpolco/security/advisories
2. Email: info@cyberpolco.com
3. If you prefer encrypted communication, use our PGP public key (replace with actual key/fingerprint):
   - PGP key fingerprint: <PGP-FINGERPRINT-HERE>
   - PGP public key: https://example.com/pgp-key.txt

When reporting, please DO NOT open a public issue. Public disclosure may expose users before a fix is available.

### Information to include
- A clear, concise description of the vulnerability and its impact.
- Steps to reproduce (ideally with minimal reproducible example).
- Affected versions, branches, or deployment configurations.
- Proof-of-concept (PoC) code, screenshots, or logs (when safe).
- Any time-sensitive details or active exploits, if known.
- Your contact information and whether we may credit you publicly.

## How we handle reports

- Acknowledgement: We will acknowledge receipt within 48 hours.
- Triage: We will verify and triage the report and provide an initial assessment within 7 calendar days.
- Remediation: We will propose and work on a fix as soon as possible. For most classes of vulnerabilities we aim to release a patch within 30–90 days depending on severity and complexity.
- Communication: We will keep the reporter informed about progress. If you prefer to remain anonymous or request coordinated disclosure, we will honor that request where feasible.
- CVE: For vulnerabilities that meet the criteria, we will coordinate assignment of a CVE identifier.

## Severity and disclosure timeline

- For critical or actively exploited vulnerabilities, we may issue an out-of-band patch and advisory immediately after fixes are released.
- We follow coordinated disclosure best practices. We will not publicly disclose a vulnerability until:
  - A fix or mitigation is available, or
  - We have agreed upon a timeline with the reporter.

If you are a security researcher and would like public credit for your report, tell us when you report the issue and we will include attribution in the advisory unless you request otherwise.

## Supported versions & scope

- This repository contains the Cyber PolCo corporate website code (frontend and build artifacts); security reports should describe which parts of the repository are affected.
- If the issue involves a third-party dependency, indicate the dependency name and version. We rely on Dependabot and maintainers of those dependencies to release fixes — we will coordinate and publish mitigation guidance where possible.

## Reporting vulnerabilities in third-party services/deployments

- If the vulnerability exists in a hosted deployment (e.g., a production site), provide the affected URL, deployment details, and whether you have access to exploit the issue. If the issue is specific to a deployment configuration, include configuration details and suggested mitigations.

## Safe harbor

We welcome responsible security research. We will not pursue legal action against reporters who:
- Act in good faith to report vulnerabilities,
- Avoid privacy violations, data access, or denial-of-service as part of proof-of-concept beyond what is necessary to demonstrate the issue,
- Follow the reporting guidance above and avoid public disclosure before the issue is addressed.

## After a fix

- We will publish a security advisory describing the vulnerability, affected versions, mitigation steps, and attribution (if approved by the reporter) once a patch is available.
- If a CVE is assigned, it will be listed in the advisory.

## Contact & updates

- Replace the contact details above with the appropriate project/organization email or team contact.
- If you have questions about this policy or the handling of a report, contact us via the channels above.

Thank you — we appreciate your help keeping Cyber PolCo secure.
