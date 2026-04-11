import Brevo from '@getbrevo/brevo';

const client = new Brevo.TransactionalEmailsApi();

// Set API key
client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.APIKEY, process.env.BREVO_API_KEY);

export default client;
