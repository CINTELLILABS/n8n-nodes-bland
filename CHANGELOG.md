# Changelog

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
