import { createHmac, timingSafeEqual } from 'crypto';
import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

/**
 * Bland posts two kinds of webhook, both as a flat JSON body signed with an
 * `X-Webhook-Signature` header (HMAC-SHA256, hex, over the raw body):
 *
 *  - The post-call report: the completed call record.
 *  - In-call events: `{ message, call_id, category, log_level }`, where
 *    `category` is the event type and is absent from call records.
 */
const EVENT_CATEGORIES = [
	'call',
	'citations',
	'dynamic_data',
	'latency',
	'queue',
	'tool',
	'webhook',
] as const;

/** In-call events carry `category`; post-call records never do. */
const isInCallEvent = (body: IDataObject): boolean => typeof body.category === 'string';

/** Constant-time compare that tolerates differing lengths. */
const signaturesMatch = (a: string, b: string): boolean => {
	const bufA = Buffer.from(a, 'utf8');
	const bufB = Buffer.from(b, 'utf8');
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
};

// Two rules are suppressed here, both deliberately:
//
// `node-usable-as-tool`: an AI agent can't invoke a trigger, and the property's
// type only permits `true`, so there is no way to express "not a tool".
//
// `webhook-lifecycle-complete`: a Bland account has a single default webhook
// URL, so registering one automatically would replace an account-wide setting
// shared by every call. This node therefore exposes its URL for the user to
// paste into a Send operation's Webhook URL field instead of registering itself.
// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool, @n8n/community-nodes/webhook-lifecycle-complete
export class BlandTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bland Trigger',
		name: 'blandTrigger',
		icon: { light: 'file:../Bland/bland.svg', dark: 'file:../Bland/bland.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["triggerOn"]}}',
		description: 'Starts a workflow when Bland posts a call webhook',
		defaults: {
			name: 'Bland Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'blandApi',
				// Only needed to verify signatures, which requires the signing secret.
				required: false,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'A Bland account has one default webhook URL, so this node does not register itself. Copy the Production URL above into the <b>Webhook URL</b> field of a Bland node\'s Send operation, or set it as your account default in the Bland dashboard.',
				name: 'setupNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				default: 'all',
				description: 'Which kind of Bland webhook should start the workflow',
				options: [
					{
						name: 'Any Webhook',
						value: 'all',
						description: 'Trigger on both post-call reports and in-call events',
					},
					{
						name: 'In-Call Event Only',
						value: 'events',
						description: 'Only events sent while a call is running',
					},
					{
						name: 'Post-Call Report Only',
						value: 'postCall',
						description: 'Only the call record sent once a call completes',
					},
				],
			},
			{
				displayName: 'Categories',
				name: 'categories',
				type: 'multiOptions',
				default: [],
				displayOptions: {
					show: {
						triggerOn: ['events'],
					},
				},
				description:
					'Which event categories to accept. Leave empty to accept all of them. Bland only sends the categories you list in the call\'s webhook events.',
				options: EVENT_CATEGORIES.map((category) => ({ name: category, value: category })),
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: false,
				description:
					'Whether to reject requests whose X-Webhook-Signature does not match. Requires the Webhook Signing Secret on the Bland credential.',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const headers = this.getHeaderData() as Record<string, string | undefined>;
		const triggerOn = this.getNodeParameter('triggerOn', 'all') as string;
		const verifySignature = this.getNodeParameter('verifySignature', false) as boolean;

		if (verifySignature) {
			// The credential is optional on this node, so surface a clear message
			// rather than n8n's generic "no credentials set" error.
			let secret = '';
			try {
				const credentials = await this.getCredentials('blandApi');
				secret = (credentials?.webhookSecret as string) ?? '';
			} catch {
				throw new NodeOperationError(
					this.getNode(),
					'Signature verification is on, but no Bland credential is attached to this node',
					{
						description:
							'Attach a Bland credential and set its Webhook Signing Secret, or turn off Verify Signature.',
					},
				);
			}
			if (!secret) {
				throw new NodeOperationError(
					this.getNode(),
					'Signature verification is on, but no Webhook Signing Secret is set on the Bland credential',
				);
			}

			const provided = headers['x-webhook-signature'];
			// Hash the exact bytes received so re-serialising can't change the result.
			const request = this.getRequestObject() as unknown as { rawBody?: Buffer };
			const signedText = request.rawBody
				? request.rawBody.toString('utf8')
				: JSON.stringify(body);
			const expected = createHmac('sha256', secret).update(signedText).digest('hex');

			if (!provided || !signaturesMatch(provided, expected)) {
				const response = this.getResponseObject();
				response.status(401).send('Invalid signature');
				return { noWebhookResponse: true };
			}
		}

		// Respond 200 but don't start the workflow when this webhook was filtered out.
		const inCallEvent = isInCallEvent(body);
		if (triggerOn === 'postCall' && inCallEvent) return {};
		if (triggerOn === 'events') {
			if (!inCallEvent) return {};
			const categories = this.getNodeParameter('categories', []) as string[];
			if (categories.length > 0 && !categories.includes(body.category as string)) return {};
		}

		return {
			workflowData: [this.helpers.returnJsonArray([body])],
		};
	}
}
