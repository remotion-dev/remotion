---
sidebar_label: Validate Webhooks
title: Validate Webhooks
slug: /lambda/validate-webhooks
---

```javascript
import * as Crypto from "crypto";

// Express API endpoint
router.post("/my-remotion-webhook-endpoint", (req, res) => {
  const hmac = Crypto.createHmac("sha1", REMOTION_AWS_SECRET_ACCESS_KEY);
  const signature = `sha1=${hmac
    .update(JSON.stringify(req.body))
    .digest("hex")}`;

  if (signature !== req.header("X-REMOTION-SIGNATURE")) {
    // Request wasn't sent by Remotion
    // ...
  } else {
    // Request was sent by Remotion
    // ...
  }
});
```
