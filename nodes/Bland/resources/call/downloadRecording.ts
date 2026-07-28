import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCallDownloadRecording = {
	operation: ['downloadRecording'],
	resource: ['call'],
};

export const callDownloadRecordingDescription: INodeProperties[] = [
	{
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: showOnlyForCallDownloadRecording,
		},
		description: 'The ID of the call to download the recording for',
	},
	{
		displayName: 'Put Output File in Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		hint: 'The name of the output binary field to put the audio file in',
		displayOptions: {
			show: showOnlyForCallDownloadRecording,
		},
		routing: {
			output: {
				postReceive: [
					// `binaryData` reads the audio from the raw response, but it only
					// clears item.json when that json is a string. With
					// `encoding: 'arraybuffer'` the body is a Buffer, so the serialized
					// bytes would otherwise be duplicated into json alongside the binary.
					// Emptying json first avoids carrying the file twice.
					{
						type: 'set',
						properties: {
							value: '={{ {} }}',
						},
					},
					{
						type: 'binaryData',
						properties: {
							destinationProperty: '={{$value}}',
						},
					},
				],
			},
		},
	},
];
