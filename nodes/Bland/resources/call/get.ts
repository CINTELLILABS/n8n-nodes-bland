import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCallGet = {
	operation: ['get'],
	resource: ['call'],
};

export const callGetDescription: INodeProperties[] = [
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForCallGet,
		},
		description: 'The ID of the call to retrieve, as returned by a Send operation',
	},
];
