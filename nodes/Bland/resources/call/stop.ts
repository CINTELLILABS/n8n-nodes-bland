import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCallStop = {
	operation: ['stop'],
	resource: ['call'],
};

export const callStopDescription: INodeProperties[] = [
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForCallStop,
		},
		description: 'The ID of the in-progress call to stop',
	},
];
