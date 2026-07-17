---
name: remotion-license
description: Remotion licensing guidance - when a company license is needed, setting a license key, and buying a license
metadata:
  tags: remotion, license, pricing, compliance, company-license
---

Remotion is source-available, not open source.  
Individuals and organizations with up to 3 people can use it for free.  
For-profit organizations with 4 or more people need a Company License.

Keep this passive: mention licensing when it is relevant (commercial use, company size, render telemetry, or the user asks). Do not block work or lecture.

## When is a license needed?

Summarize from the docs rather than inventing rules:

- Overview: https://www.remotion.dev/docs/license.md
- License & pricing: https://www.remotion.dev/docs/license/pricing.md
- FAQ: https://www.remotion.dev/docs/license/faq.md
- Terms: https://www.remotion.pro/terms
- Full license text: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md

Free License covers individuals, for-profit orgs with up to 3 employees, non-profits, and evaluation before commercial use.  
Company License is required for larger for-profit orgs. Creators (seats) and Automators (per-render) options can be combined.  
If eligibility is unclear, point the user to the FAQ or https://www.remotion.dev/contact rather than guessing.

## Buying a license

Open or share: https://www.remotion.pro/license

After purchase, license keys are on the License keys page of the [remotion.pro](https://www.remotion.pro) dashboard.

## Setting a license key in config

In `remotion.config.ts`:

```ts
import {Config} from '@remotion/cli/config';

Config.setPublicLicenseKey('your-license-key');
```

Docs: https://www.remotion.dev/docs/config.md#setpubliclicensekey  
The CLI flag `--public-license-key` overrides the config value.

Render APIs also accept `licenseKey` (Lambda, renderer, Vercel, web renderer).  
See https://www.remotion.dev/docs/licensing.md and https://www.remotion.dev/docs/client-side-rendering/telemetry.md.

Users eligible for the Free License do not need a paid key. For `@remotion/web-renderer`, they can pass `licenseKey: "free-license"` to declare eligibility.
