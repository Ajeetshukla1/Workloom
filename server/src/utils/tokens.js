import crypto from 'crypto'

export const createTokenPair = () => {
    const token = crypto.randomBytes(32).toString('hex')
    const hash = crypto.createHash('sha256').update(token).digest('hex')
    return { token, hash }
}

export const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex')
