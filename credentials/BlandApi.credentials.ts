import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class BlandApi implements ICredentialType {
	name = 'blandApi';

	displayName = 'Bland API';

	icon: Icon = {
		light: 'file:../nodes/Bland/bland.svg',
		dark: 'file:../nodes/Bland/bland.dark.svg',
	};

	documentationUrl = 'https://github.com/CINTELLILABS/n8n-nodes-bland#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Your Bland API key, found in the Bland dashboard',
		},
		{
			// Only used by the Bland Trigger node to verify webhook signatures. It
			// can't be read back from the API, so it has to be supplied here.
			displayName: 'Webhook Signing Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Optional. Only needed by the Bland Trigger node to verify webhook signatures. Find it in the Bland dashboard.',
		},
	];

	// Bland reads the raw key from the Authorization header. A `Bearer ` prefix is
	// tolerated by the API but not required, so the key is sent as-is.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.bland.ai',
			url: '/v1/me',
		},
	};
}
