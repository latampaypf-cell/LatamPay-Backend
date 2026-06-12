import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import config from '../config';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
}

class SESEmailProvider implements EmailProvider {
  private client: SESClient;

  constructor() {
    this.client = new SESClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId || '',
        secretAccessKey: config.aws.secretAccessKey || '',
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    const { to, subject, text, html } = options;

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: html ? { Data: html } : undefined,
          Text: text ? { Data: text } : undefined,
        },
        Subject: { Data: subject },
      },
      Source: config.aws.fromEmail,
    });

    try {
      await this.client.send(command);
      console.log(`📧 Email sent to ${to} via AWS SES`);
    } catch (error: any) {
      // Check if it's a Sandbox verification error
      if (error.name === 'MessageRejected' && error.message.includes('Address blacklisted') || error.message.includes('not verified')) {
        console.warn(`⚠️ AWS SES Sandbox: Recipient ${to} is not verified. Falling back to mock log.`);
        this.mockLog(options);
        return;
      }
      console.error('❌ Error sending email via SES:', error);
      throw error;
    }
  }

  private mockLog(options: EmailOptions) {
    console.log('--- MOCK EMAIL START ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text || options.html}`);
    console.log('--- MOCK EMAIL END ---');
  }
}

class MockEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<void> {
    console.log('--- MOCK EMAIL (DEV MODE) ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content: ${options.text || options.html}`);
    console.log('-----------------------------');
  }
}

// Factory logic
const provider: EmailProvider = (config.enableEmailMock || !config.aws.accessKeyId)
  ? new MockEmailProvider()
  : new SESEmailProvider();

export const sendEmail = async (options: EmailOptions) => {
  return provider.send(options);
};
