import { createHmac, timingSafeEqual } from 'crypto';
import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IHookFunctions,
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

const BASE_URL = 'https://api.bland.ai';

/** In-call events carry `category`; post-call records never do. */
const isInCallEvent = (body: IDataObject): boolean => typeof body.category === 'string';

/** Constant-time compare that tolerates differing lengths. */
const signaturesMatch = (a: string, b: string): boolean => {
	const bufA = Buffer.from(a, 'utf8');
	const bufB = Buffer.from(b, 'utf8');
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
};

const getAccountWebhookUrl = async (context: IHookFunctions): Promise<string | null> => {
	const response = (await context.helpers.httpRequestWithAuthentication.call(context, 'blandApi', {
		method: 'GET',
		url: `${BASE_URL}/user/getCurrentWebhook`,
		json: true,
	})) as { webhook_url?: string | null };
	return response?.webhook_url ?? null;
};

const setAccountWebhookUrl = async (context: IHookFunctions, url: string): Promise<void> => {
	await context.helpers.httpRequestWithAuthentication.call(context, 'blandApi', {
		method: 'POST',
		url: `${BASE_URL}/user/updateCurrentWebhook`,
		body: { webhook_url: url },
		json: true,
	});
};

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
		// An AI agent can't invoke a webhook trigger, but the property is required.
		// Setting it makes n8n generate a "Bland Trigger Tool" variant, so that
		// variant is hidden from the nodes panel rather than confusing users.
		usableAsTool: { replacements: { hidden: true } },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'blandApi',
				// Needed to verify signatures, and to manage the account webhook.
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
					'A Bland account has one default webhook URL, so this node does not register itself unless you ask it to. Copy the Production URL above into the <b>Webhook URL</b> field of a Bland node\'s Send operation, or set it as your account default in the Bland dashboard.',
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
			{
				displayName: 'Manage Account Default Webhook',
				name: 'manageAccountWebhook',
				type: 'boolean',
				default: false,
				description:
					'Whether to point your Bland account default webhook at this node automatically. A Bland account stores only ONE default webhook, so turning this on replaces whatever is currently set and affects every call that does not specify its own webhook. Requires an https n8n URL.',
			},
			{
				displayName:
					'Bland cannot clear a default webhook once set. On deactivation this node restores the URL that was there before, but if none was set the account default stays pointed at n8n.',
				name: 'manageAccountWebhookNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						manageAccountWebhook: [true],
					},
				},
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const manage = this.getNodeParameter('manageAccountWebhook', false) as boolean;
				// In manual mode nothing is registered remotely, so report it as already
				// present to stop n8n from calling create().
				if (!manage) return true;

				return (await getAccountWebhookUrl(this)) === this.getNodeWebhookUrl('default');
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const manage = this.getNodeParameter('manageAccountWebhook', false) as boolean;
				if (!manage) return true;

				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl?.startsWith('https://')) {
					throw new NodeOperationError(
						this.getNode(),
						'Bland only accepts https webhook URLs, so the account default cannot be pointed at this n8n instance',
						{
							description:
								'This happens on a local or http-only n8n. Turn off "Manage Account Default Webhook" and paste the Production URL into the Bland node\'s Webhook URL field instead.',
						},
					);
				}

				// Remember the existing value so delete() can put it back.
				this.getWorkflowStaticData('node').previousWebhookUrl = await getAccountWebhookUrl(this);
				await setAccountWebhookUrl(this, webhookUrl);
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const manage = this.getNodeParameter('manageAccountWebhook', false) as boolean;
				if (!manage) return true;

				const staticData = this.getWorkflowStaticData('node');
				const previous = staticData.previousWebhookUrl;
				delete staticData.previousWebhookUrl;

				// The API rejects an empty webhook_url, so an account that had no default
				// before cannot be restored to that state.
				if (typeof previous === 'string' && previous.startsWith('https://')) {
					await setAccountWebhookUrl(this, previous);
				}
				return true;
			},
		},
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
