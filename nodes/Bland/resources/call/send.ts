import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCallSend = {
	operation: ['send'],
	resource: ['call'],
};

export const callSendDescription: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+15551234567',
		displayOptions: {
			show: showOnlyForCallSend,
		},
		description: 'The number to call, in E.164 format including the country code',
		routing: {
			send: {
				type: 'body',
				property: 'phone_number',
			},
		},
	},
	{
		// The API rejects agent_id combined with pathway_id or persona_id, so these
		// are surfaced as an exclusive choice rather than three optional fields.
		displayName: 'Call Using',
		name: 'callUsing',
		type: 'options',
		noDataExpression: true,
		default: 'task',
		displayOptions: {
			show: showOnlyForCallSend,
		},
		description: 'What drives the conversation. These options are mutually exclusive.',
		options: [
			{
				name: 'Agent',
				value: 'agent',
				description: 'A saved Bland agent',
			},
			{
				name: 'Pathway',
				value: 'pathway',
				description: 'A saved conversational pathway',
			},
			{
				name: 'Prompt',
				value: 'task',
				description: 'A plain-language instruction written inline',
			},
		],
	},
	{
		displayName: 'Prompt',
		name: 'task',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		placeholder: 'You are calling to confirm a dentist appointment for Tuesday at 3pm',
		displayOptions: {
			show: {
				...showOnlyForCallSend,
				callUsing: ['task'],
			},
		},
		description: 'Instructions describing what the AI should do on the call',
		routing: {
			send: {
				type: 'body',
				property: 'task',
			},
		},
	},
	{
		displayName: 'Pathway ID',
		name: 'pathwayId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				...showOnlyForCallSend,
				callUsing: ['pathway'],
			},
		},
		description: 'The ID of the conversational pathway to run',
		routing: {
			send: {
				type: 'body',
				property: 'pathway_id',
			},
		},
	},
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0e1b2c3d-4e5f-6789-abcd-ef0123456789',
		hint: 'Must be a valid UUID',
		displayOptions: {
			show: {
				...showOnlyForCallSend,
				callUsing: ['agent'],
			},
		},
		description: 'The ID of the agent to run the call',
		routing: {
			send: {
				type: 'body',
				property: 'agent_id',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForCallSend,
		},
		options: [
			{
				displayName: 'Answering Machine Detection',
				name: 'amd',
				type: 'boolean',
				default: false,
				description: 'Whether to detect answering machines and voicemail before speaking',
				routing: {
					send: {
						type: 'body',
						property: 'amd',
					},
				},
			},
			{
				displayName: 'First Sentence',
				name: 'firstSentence',
				type: 'string',
				default: '',
				description: 'The exact first thing the AI says when the call connects',
				routing: {
					send: {
						type: 'body',
						property: 'first_sentence',
					},
				},
			},
			{
				displayName: 'From Number',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: '+15557654321',
				description: 'The caller ID to dial from. Bland picks one automatically if omitted.',
				routing: {
					send: {
						type: 'body',
						property: 'from',
					},
				},
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: 'en',
				description: 'The language code used for speech recognition and synthesis',
				routing: {
					send: {
						type: 'body',
						property: 'language',
					},
				},
			},
			{
				displayName: 'Max Duration',
				name: 'maxDuration',
				type: 'number',
				default: 12,
				typeOptions: {
					minValue: 1,
				},
				description: 'Maximum length of the call in minutes before it is ended automatically',
				routing: {
					send: {
						type: 'body',
						property: 'max_duration',
					},
				},
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description:
					'Arbitrary JSON stored with the call and returned when you retrieve it or in webhooks',
				routing: {
					send: {
						type: 'body',
						property: 'metadata',
						value: '={{ JSON.parse($value) }}',
					},
				},
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				description: 'The conversational model to use. Leave empty for the Bland default.',
				routing: {
					send: {
						type: 'body',
						property: 'model',
					},
				},
			},
			{
				displayName: 'Record',
				name: 'record',
				type: 'boolean',
				default: false,
				description: 'Whether to record the call so the audio can be retrieved afterwards',
				routing: {
					send: {
						type: 'body',
						property: 'record',
					},
				},
			},
			{
				displayName: 'Request Data',
				name: 'requestData',
				type: 'json',
				default: '{}',
				description:
					'JSON of variables the AI can reference in the prompt, for example {{name}}',
				routing: {
					send: {
						type: 'body',
						property: 'request_data',
						value: '={{ JSON.parse($value) }}',
					},
				},
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'string',
				default: '',
				placeholder: '2026-08-01 14:00:00',
				description:
					'Schedule the call for a future time instead of dialing immediately. Interpreted in the Timezone field if set, otherwise UTC.',
				routing: {
					send: {
						type: 'body',
						property: 'start_time',
					},
				},
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				default: 0.7,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				description: 'How much the model improvises. Lower values stay closer to the prompt.',
				routing: {
					send: {
						type: 'body',
						property: 'temperature',
					},
				},
			},
			{
				displayName: 'Timezone',
				name: 'timezone',
				type: 'string',
				default: '',
				placeholder: 'America/New_York',
				description: 'IANA timezone used to interpret Start Time',
				routing: {
					send: {
						type: 'body',
						property: 'timezone',
					},
				},
			},
			{
				displayName: 'Transfer Phone Number',
				name: 'transferPhoneNumber',
				type: 'string',
				default: '',
				description: 'The number to transfer the call to if the AI decides to hand off',
				routing: {
					send: {
						type: 'body',
						property: 'transfer_phone_number',
					},
				},
			},
			{
				displayName: 'Voice',
				name: 'voice',
				type: 'options',
				default: '',
				typeOptions: {
					loadOptions: {
						routing: {
							request: {
								method: 'GET',
								url: '/v1/voices',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'voices',
										},
									},
									{
										type: 'setKeyValue',
										properties: {
											name: '={{$responseItem.name}}',
											value: '={{$responseItem.id}}',
										},
									},
									{
										type: 'sort',
										properties: {
											key: 'name',
										},
									},
								],
							},
						},
					},
				},
				description:
					'The voice to speak with. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: {
					send: {
						type: 'body',
						property: 'voice',
					},
				},
			},
			{
				displayName: 'Voicemail Message',
				name: 'voicemailMessage',
				type: 'string',
				default: '',
				description: 'Message to leave if the call reaches voicemail',
				routing: {
					send: {
						type: 'body',
						property: 'voicemail_message',
					},
				},
			},
			{
				displayName: 'Wait for Greeting',
				name: 'waitForGreeting',
				type: 'boolean',
				default: false,
				description: 'Whether to wait for the person to speak first before the AI talks',
				routing: {
					send: {
						type: 'body',
						property: 'wait_for_greeting',
					},
				},
			},
			{
				displayName: 'Webhook URL',
				name: 'webhook',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/bland-events',
				description: 'URL Bland posts call events and the final call record to',
				routing: {
					send: {
						type: 'body',
						property: 'webhook',
					},
				},
			},
		],
	},
];
