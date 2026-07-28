import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCallGetRecordingUrl = {
	operation: ['getRecordingUrl'],
	resource: ['call'],
};

export const callGetRecordingUrlDescription: INodeProperties[] = [
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForCallGetRecordingUrl,
		},
		description: 'The ID of the call to get the recording URL for',
	},
];
