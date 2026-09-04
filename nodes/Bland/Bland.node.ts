import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { callDescription } from './resources/call';
import { generatedDescriptions, generatedResources } from './resources/generated';

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
					// BEGIN BLAND SYNC GENERATED RESOURCES
					/* eslint n8n-nodes-base/node-param-resource-with-plural-option: off -- the rule cannot parse a spread element */
					...generatedResources,
					// END BLAND SYNC GENERATED RESOURCES
				],
				default: 'call',
			},
			...callDescription,
			// BEGIN BLAND SYNC GENERATED PROPERTIES
			...generatedDescriptions,
			// END BLAND SYNC GENERATED PROPERTIES
		],
	};
}
