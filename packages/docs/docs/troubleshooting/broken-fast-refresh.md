---
image: /generated/articles-docs-troubleshooting-broken-fast-refresh.png
id: broken-fast-refresh
title: Fast Refresh not working
crumb: "Troubleshooting"
---

If the Remotion Studio does not update after you have updated your file, it is usually due to one of two reasons:

<Step>1</Step> Studio server disconnected: This happens when you quit the process that was started when running <code>npx remotion studio</code>, usually using <code>Ctrl+C</code> or by quitting the terminal. <br/><br/>

<Step>2</Step> Mismatched capitalization in the filenames: Ensure that the capitalization of filenames is correct in imports. For example, if your filename is <code>MyComp.tsx</code>, but you import it using <code>{'import {MyComp} from "./myComp.tsx"'}</code>, Fast Refresh may break. <br/><br/>

:::note
This is a bug in Webpack for which [we've filed an issue](https://github.com/webpack/watchpack/issues/228).
:::
