import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCallGetAll = {
	operation: ['getAll'],
	resource: ['call'],
};

export const callGetAllDescription: INodeProperties[] = [
	{
		// Note: this endpoint pages by from/to result index rather than
		// limit/offset, so n8n's built-in offset pagination doesn't apply. Use the
		// Start/End Index options to page manually.
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		displayOptions: {
			show: showOnlyForCallGetAll,
		},
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: showOnlyForCallGetAll,
		},
		options: [
			{
				displayName: 'Answered By',
				name: 'answeredBy',
				type: 'options',
				default: 'human',
				description: 'Only return calls answered by this type of recipient',
				options: [
					{
						name: 'Human',
						value: 'human',
					},
					{
						name: 'Machine',
						value: 'machine',
					},
					{
						name: 'Unknown',
						value: 'unknown',
					},
					{
						name: 'Voicemail',
						value: 'voicemail',
					},
				],
				routing: {
					send: {
						type: 'query',
						property: 'answered_by',
					},
				},
			},
			{
				displayName: 'Batch ID',
				name: 'batchId',
				type: 'string',
				default: '',
				description: 'Only return calls belonging to this batch',
				routing: {
					send: {
						type: 'query',
						property: 'batch_id',
					},
				},
			},
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				description: 'Only return calls belonging to this campaign',
				routing: {
					send: {
						type: 'query',
						property: 'campaign_id',
					},
				},
			},
			{
				displayName: 'Completed',
				name: 'completed',
				type: 'boolean',
				default: true,
				description: 'Whether to only return calls that have finished',
				routing: {
					send: {
						type: 'query',
						property: 'completed',
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Only return calls created before this date',
				routing: {
					send: {
						type: 'query',
						property: 'end_date',
					},
				},
			},
			{
				displayName: 'From Number',
				name: 'fromNumber',
				type: 'string',
				default: '',
				description: 'Only return calls placed from this number',
				routing: {
					send: {
						type: 'query',
						property: 'from_number',
					},
				},
			},
			{
				displayName: 'Inbound',
				name: 'inbound',
				type: 'boolean',
				default: false,
				description: 'Whether to only return inbound calls instead of outbound ones',
				routing: {
					send: {
						type: 'query',
						property: 'inbound',
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Only return calls created after this date',
				routing: {
					send: {
						type: 'query',
						property: 'start_date',
					},
				},
			},
			{
				displayName: 'To Number',
				name: 'toNumber',
				type: 'string',
				default: '',
				description: 'Only return calls placed to this number',
				routing: {
					send: {
						type: 'query',
						property: 'to_number',
					},
				},
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: showOnlyForCallGetAll,
		},
		options: [
			{
				displayName: 'Ascending',
				name: 'ascending',
				type: 'boolean',
				default: false,
				description: 'Whether to sort oldest first instead of newest first',
				routing: {
					send: {
						type: 'query',
						property: 'ascending',
					},
				},
			},
			{
				displayName: 'End Index',
				name: 'to',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
				},
				description: 'Index of the last result to return, for manual paging',
				routing: {
					send: {
						type: 'query',
						property: 'to',
					},
				},
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				default: 'created_at',
				description: 'Which timestamp to sort the results by',
				options: [
					{
						name: 'Created At',
						value: 'created_at',
					},
					{
						name: 'Updated At',
						value: 'updated_at',
					},
				],
				routing: {
					send: {
						type: 'query',
						property: 'sort_by',
					},
				},
			},
			{
				displayName: 'Start Index',
				name: 'from',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
				},
				description: 'Index of the first result to return, for manual paging',
				routing: {
					send: {
						type: 'query',
						property: 'from',
					},
				},
			},
		],
	},
];
