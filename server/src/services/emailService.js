import nodemailer from 'nodemailer'

const hasSmtpConfig = () =>
    Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    )

const createTransport = () =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })

export const sendEmail = async ({ to, subject, html }) => {
    if (!hasSmtpConfig()) {
        console.log('[email] SMTP not configured. Payload:', { to, subject, html })
        return
    }

    const transporter = createTransport()
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'Workloom <no-reply@workloom.local>',
        to,
        subject,
        html,
    })
}
