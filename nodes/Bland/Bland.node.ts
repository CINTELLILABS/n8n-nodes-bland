import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { callDescription } from './resources/call';

export class Bland implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bland',
		name: 'bland',
		icon: { light: 'file:bland.svg', dark: 'file:bland.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send and manage Bland AI phone calls',
		defaults: {
			name: 'Bland',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'blandApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.bland.ai',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Call',
						value: 'call',
					},
				],
				default: 'call',
			},
			...callDescription,
		],
	};
}
