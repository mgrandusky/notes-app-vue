import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { env } from '../config/env';

/**
 * Email options
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

/**
 * Email template types
 */
export type EmailTemplate = 
  | 'welcome'
  | 'password-reset'
  | 'verification'
  | 'note-shared'
  | 'collaboration-invite'
  | 'export-ready'
  | 'notification';

/**
 * Email template data
 */
export interface EmailTemplateData {
  [key: string]: any;
}

/**
 * Email sending result
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service with Nodemailer
 * Send emails with templates and attachments
 */
export class EmailService {
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;

  constructor() {
    this.fromAddress = env.EMAIL_FROM;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_SECURE,
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD
        }
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Send email
   * @param options - Email options
   * @returns Promise<EmailResult>
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not initialized'
      };
    }

    try {
      const mailOptions: SendMailOptions = {
        from: this.fromAddress,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send email using template
   * @param template - Template name
   * @param to - Recipient email(s)
   * @param data - Template data
   * @returns Promise<EmailResult>
   */
  async sendTemplateEmail(
    template: EmailTemplate,
    to: string | string[],
    data: EmailTemplateData
  ): Promise<EmailResult> {
    const { subject, html, text } = this.renderTemplate(template, data);

    return this.sendEmail({
      to,
      subject,
      html,
      text
    });
  }

  /**
   * Send welcome email
   * @param to - Recipient email
   * @param userName - User's name
   * @returns Promise<EmailResult>
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<EmailResult> {
    return this.sendTemplateEmail('welcome', to, { userName });
  }

  /**
   * Send password reset email
   * @param to - Recipient email
   * @param resetLink - Password reset link
   * @param userName - User's name
   * @returns Promise<EmailResult>
   */
  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    userName: string
  ): Promise<EmailResult> {
    return this.sendTemplateEmail('password-reset', to, { userName, resetLink });
  }

  /**
   * Send email verification
   * @param to - Recipient email
   * @param verificationLink - Verification link
   * @param userName - User's name
   * @returns Promise<EmailResult>
   */
  async sendVerificationEmail(
    to: string,
    verificationLink: string,
    userName: string
  ): Promise<EmailResult> {
    return this.sendTemplateEmail('verification', to, { userName, verificationLink });
  }

  /**
   * Send note shared notification
   * @param to - Recipient email
   * @param noteTitle - Title of shared note
   * @param sharedBy - Name of person sharing
   * @param noteLink - Link to note
   * @returns Promise<EmailResult>
   */
  async sendNoteSharedEmail(
    to: string,
    noteTitle: string,
    sharedBy: string,
    noteLink: string
  ): Promise<EmailResult> {
    return this.sendTemplateEmail('note-shared', to, {
      noteTitle,
      sharedBy,
      noteLink
    });
  }

  /**
   * Send collaboration invite
   * @param to - Recipient email
   * @param invitedBy - Name of inviter
   * @param noteTitle - Title of note
   * @param inviteLink - Collaboration link
   * @returns Promise<EmailResult>
   */
  async sendCollaborationInvite(
    to: string,
    invitedBy: string,
    noteTitle: string,
    inviteLink: string
  ): Promise<EmailResult> {
    return this.sendTemplateEmail('collaboration-invite', to, {
      invitedBy,
      noteTitle,
      inviteLink
    });
  }

  /**
   * Send export ready notification
   * @param to - Recipient email
   * @param downloadLink - Link to download export
   * @returns Promise<EmailResult>
   */
  async sendExportReadyEmail(
    to: string,
    downloadLink: string
  ): Promise<EmailResult> {
    return this.sendTemplateEmail('export-ready', to, { downloadLink });
  }

  /**
   * Render email template
   * @param template - Template name
   * @param data - Template data
   * @returns Rendered template
   */
  private renderTemplate(
    template: EmailTemplate,
    data: EmailTemplateData
  ): { subject: string; html: string; text: string } {
    const templates: Record<EmailTemplate, (data: any) => { subject: string; html: string; text: string }> = {
      'welcome': (d) => ({
        subject: 'Welcome to Notes App!',
        html: `
          <h1>Welcome, ${d.userName}! 🎉</h1>
          <p>Thank you for joining Notes App. We're excited to have you on board!</p>
          <p>Start creating, organizing, and collaborating on your notes today.</p>
          <p><a href="${env.FRONTEND_URL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a></p>
        `,
        text: `Welcome, ${d.userName}! Thank you for joining Notes App. Visit ${env.FRONTEND_URL} to get started.`
      }),

      'password-reset': (d) => ({
        subject: 'Reset Your Password',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi ${d.userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p><a href="${d.resetLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        text: `Hi ${d.userName}, Click this link to reset your password: ${d.resetLink}. This link expires in 1 hour.`
      }),

      'verification': (d) => ({
        subject: 'Verify Your Email',
        html: `
          <h1>Verify Your Email Address</h1>
          <p>Hi ${d.userName},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <p><a href="${d.verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
        `,
        text: `Hi ${d.userName}, Verify your email: ${d.verificationLink}`
      }),

      'note-shared': (d) => ({
        subject: `${d.sharedBy} shared a note with you`,
        html: `
          <h1>Note Shared With You! 📝</h1>
          <p><strong>${d.sharedBy}</strong> has shared a note with you: <strong>"${d.noteTitle}"</strong></p>
          <p><a href="${d.noteLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Note</a></p>
        `,
        text: `${d.sharedBy} shared "${d.noteTitle}" with you. View: ${d.noteLink}`
      }),

      'collaboration-invite': (d) => ({
        subject: `${d.invitedBy} invited you to collaborate`,
        html: `
          <h1>Collaboration Invite! 🤝</h1>
          <p><strong>${d.invitedBy}</strong> has invited you to collaborate on: <strong>"${d.noteTitle}"</strong></p>
          <p><a href="${d.inviteLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Collaboration</a></p>
        `,
        text: `${d.invitedBy} invited you to collaborate on "${d.noteTitle}". Join: ${d.inviteLink}`
      }),

      'export-ready': (d) => ({
        subject: 'Your Export is Ready',
        html: `
          <h1>Export Complete! ✅</h1>
          <p>Your note export is ready for download.</p>
          <p><a href="${d.downloadLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Export</a></p>
          <p>This link will expire in 24 hours.</p>
        `,
        text: `Your export is ready. Download: ${d.downloadLink}`
      }),

      'notification': (d) => ({
        subject: d.subject || 'Notification from Notes App',
        html: `
          <h1>${d.title || 'Notification'}</h1>
          <p>${d.message}</p>
          ${d.actionLink ? `<p><a href="${d.actionLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${d.actionText || 'View'}</a></p>` : ''}
        `,
        text: `${d.title || 'Notification'}: ${d.message}${d.actionLink ? ` - ${d.actionLink}` : ''}`
      })
    };

    return templates[template](data);
  }

  /**
   * Verify email configuration
   * @returns Promise<boolean>
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email server connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error);
      return false;
    }
  }

  /**
   * Send batch emails
   * @param emails - Array of email options
   * @returns Promise<EmailResult[]>
   */
  async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
    return Promise.all(emails.map(email => this.sendEmail(email)));
  }

  /**
   * Validate email address
   * @param email - Email address to validate
   * @returns boolean
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Singleton instance
export const emailService = new EmailService();
