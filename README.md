# @blandsdk/n8n-nodes-bland

This is an n8n community node. It lets you use [Bland](https://www.bland.ai/) in your n8n workflows.

Bland is an AI phone calling platform. You give it a phone number and either a prompt, a
conversational pathway, or a saved agent, and it places and conducts the call, then returns a
transcript, recording, and analysis.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Receiving call events](#receiving-call-events)
[Using this node with an AI agent](#using-this-node-with-an-ai-agent)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation, using the package name:

```
@blandsdk/n8n-nodes-bland
```

## Operations

This package provides two nodes.

### Bland

Acts on the **Call** resource:

| Operation | What it does |
| --- | --- |
| Send | Places an outbound call. Requires a phone number plus one of: a prompt, a pathway ID, or an agent ID. |
| Get | Retrieves a single call, including its transcript, summary, and analysis. |
| Get Many | Lists calls, with filters for date range, direction, who answered, batch, campaign, and numbers. |
| Stop | Ends a call that is currently in progress. |
| Get Recording URL | Returns a link to the call recording without downloading it. |
| Download Recording | Downloads the recording as a binary MP3 attached to the item. |

`Send` exposes the most common call settings at the top level and the rest under **Additional
Fields**, including voice (loaded from your account's voices), first sentence, recording, max
duration, transfer number, webhook URL, scheduling, and arbitrary `metadata` / `request_data`.

Prompt, pathway, and agent are mutually exclusive — the API rejects combinations — so the node
presents them as a single **Call Using** choice.

### Bland Trigger

Starts a workflow when Bland posts a webhook. Bland sends two kinds:

- **Post-call report** — the completed call record, sent once a call finishes.
- **In-call events** — sent while the call runs, carrying a `category` such as `queue`, `call`,
  `tool`, or `latency`. You choose which categories a call emits when you start it.

Options:

- **Trigger On** — react to any webhook, only post-call reports, or only in-call events.
- **Categories** — when listening for in-call events, restrict to specific categories. Leave empty
  to accept all.
- **Verify Signature** — reject requests whose `X-Webhook-Signature` doesn't match. Requires the
  Webhook Signing Secret on the credential.

## Credentials

You need a Bland API key. Create one in the [Bland dashboard](https://app.bland.ai/) and paste it
into the **Bland API** credential. The key is sent in the `Authorization` header.

The credential also has an optional **Webhook Signing Secret**, used only by the Bland Trigger node
when **Verify Signature** is enabled. It can't be read back from the API, so copy it from the
dashboard.

## Receiving call events

A Bland account has one default webhook URL, so the trigger node does **not** register itself —
doing so would replace an account-wide setting shared by every call.

To wire it up:

1. Add a **Bland Trigger** node and copy its Production URL.
2. Paste that URL into the **Webhook URL** field under Additional Fields on a **Bland → Send**
   operation, so only calls started by that workflow report back.

Alternatively, set it as your account default in the Bland dashboard to receive events for every
call. Bland only accepts `https://` webhook URLs, so a local n8n instance needs a tunnel.

## Using this node with an AI agent

This node is available as a tool to the AI Agent node.

> **Warning**
> The `Send` operation places real phone calls, which cost money and dial real people. When you
> expose this node as an AI agent tool, the agent can choose the number it dials and the prompt the
> AI speaks. Only do this with prompts and guardrails you trust, and consider restricting the node
> to read-only operations if the agent doesn't need to place calls.

## Compatibility

Requires n8n with `n8nNodesApiVersion` 1. Developed and tested against n8n 2.31 on Node.js 22.

Note that if you self-host n8n, avoid Node.js 26 — some n8n dependencies fail to build there.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Bland documentation](https://docs.bland.ai)

## Version history

### 0.1.0

Initial release. Call resource with Send, Get, Get Many, Stop, Get Recording URL, and Download
Recording, plus the Bland Trigger node with signature verification.
