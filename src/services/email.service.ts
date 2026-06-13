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
  private fromEmail: string;

  constructor(fromEmail: string) {
    this.fromEmail = fromEmail;
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
      Source: this.fromEmail,
    });

    try {
      await this.client.send(command);
      console.log(`📧 Email enviado a ${to} vía AWS SES`);
    } catch (error: any) {
      const message: string = error?.message ?? '';
      const isSandboxRejection =
        error?.name === 'MessageRejected' &&
        (message.includes('not verified') ||
          message.includes('Address blacklisted'));

      if (isSandboxRejection) {
        console.warn(
          `⚠️ SES sandbox: destinatario ${to} no verificado. Fallback a log.`,
        );
        this.mockLog(options);
        return;
      }

      console.error('❌ Error enviando email vía SES:', error);
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

const buildProvider = (): EmailProvider => {
  const { accessKeyId, secretAccessKey, fromEmail } = config.aws;

  if (config.enableEmailMock) {
    if (config.nodeEnv !== 'test') {
      console.log('✉️  Email provider: MOCK (ENABLE_EMAIL_MOCK=true)');
    }
    return new MockEmailProvider();
  }

  if (!accessKeyId || !secretAccessKey) {
    console.warn(
      '⚠️  AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY no definidos. Fallback a MOCK.',
    );
    return new MockEmailProvider();
  }

  if (!fromEmail) {
    console.warn(
      '⚠️  AWS_SES_FROM_EMAIL no definido. Fallback a MOCK. (Tiene que ser una dirección verificada en SES.)',
    );
    return new MockEmailProvider();
  }

  console.log(
    `✉️  Email provider: AWS SES (region=${config.aws.region}, from=${fromEmail})`,
  );
  return new SESEmailProvider(fromEmail);
};

const provider: EmailProvider = buildProvider();

export const sendEmail = async (options: EmailOptions) => {
  return provider.send(options);
};
