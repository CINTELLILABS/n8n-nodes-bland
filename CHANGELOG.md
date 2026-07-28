# Changelog

## 0.2.0

Changes required to pass n8n's community node verification scan, which runs its
own ESLint config and ignores inline disable comments.

### Bland Trigger

- Added **Manage Account Default Webhook** (default off). When enabled, the node
  points your Bland account default webhook at itself on activation and restores
  the previous URL on deactivation. Left off, behaviour is unchanged and no
  account setting is touched.
- Note that Bland cannot clear a default webhook once set, so deactivating with
  no previous URL leaves the account default pointed at n8n.
- Declared `usableAsTool` because the verification scan requires it. The tool
  variant it generates is hidden from the nodes panel, since an AI agent cannot
  invoke a webhook trigger.

## 0.1.0

Initial release.

### Bland

- **Call → Send** — place an outbound call using a prompt, a pathway, or an agent, with voice
  selection loaded from your account and the remaining call settings under Additional Fields.
- **Call → Get** — fetch a single call with its transcript, summary, and analysis.
- **Call → Get Many** — list calls with date, direction, answered-by, batch, campaign, and number
  filters.
- **Call → Stop** — end an in-progress call.
- **Call → Get Recording URL** — get a link to the recording.
- **Call → Download Recording** — download the recording as a binary MP3.

### Bland Trigger

- Receives both kinds of Bland webhook: the post-call report and in-call events.
- Optional `X-Webhook-Signature` verification (HMAC-SHA256 over the raw request body).
- Filter by webhook kind, and by event category for in-call events.
