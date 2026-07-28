import type { INodeProperties } from 'n8n-workflow';
import { callDownloadRecordingDescription } from './downloadRecording';
import { callGetDescription } from './get';
import { callGetAllDescription } from './getAll';
import { callGetRecordingUrlDescription } from './getRecordingUrl';
import { callSendDescription } from './send';
import { callStopDescription } from './stop';

const showOnlyForCalls = {
	resource: ['call'],
};

export const callDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCalls,
		},
		options: [
			{
				name: 'Download Recording',
				value: 'downloadRecording',
				action: 'Download a call recording',
				description: 'Download the call recording audio as a binary file',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/calls/{{$parameter.callId}}/recording',
						// Bland content-negotiates this endpoint: an audio Accept header
						// returns the audio itself, anything else returns a JSON URL.
						headers: {
							Accept: 'audio/mpeg',
						},
						encoding: 'arraybuffer',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a call',
				description: 'Get a single call, including its transcript',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/calls/{{$parameter.callId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many calls',
				description: 'List calls, with optional filters',
				routing: {
					request: {
						method: 'GET',
						url: '/v1/calls',
					},
					output: {
						// The API wraps results as { total_count, calls: [...] }. Without
						// this, n8n would emit a single item holding the whole array.
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'calls',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Recording URL',
				value: 'getRecordingUrl',
				action: 'Get a call recording URL',
				description: 'Get a link to the call recording without downloading it',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/calls/{{$parameter.callId}}/recording',
					},
				},
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send a call',
				description: 'Start an outbound AI phone call',
				routing: {
					request: {
						method: 'POST',
						url: '/v1/calls',
					},
				},
			},
			{
				name: 'Stop',
				value: 'stop',
				action: 'Stop a call',
				description: 'End a call that is currently in progress',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/calls/{{$parameter.callId}}/stop',
					},
				},
			},
		],
		default: 'send',
	},
	...callSendDescription,
	...callGetDescription,
	...callGetAllDescription,
	...callStopDescription,
	...callGetRecordingUrlDescription,
	...callDownloadRecordingDescription,
];
