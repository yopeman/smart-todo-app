import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
    const host = process.env.SMTP_HOST
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass) {
        throw new Error(
            'Email is not configured: set SMTP_HOST, SMTP_USER, and SMTP_PASS in the environment.'
        )
    }

    if (!transporter) {
        const port = Number(process.env.SMTP_PORT ?? 587)
        transporter = nodemailer.createTransport({
            host,
            port,
            secure:
                process.env.SMTP_SECURE === 'true' ||
                (process.env.SMTP_SECURE !== 'false' && port === 465),
            auth: { user, pass },
        })
    }

    return transporter
}

const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
    const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER
    if (!from) {
        throw new Error('Set EMAIL_FROM or SMTP_USER for the sender address.')
    }

    await getTransporter().sendMail({
        from,
        to,
        subject,
        text,
    })
}

export default sendEmail