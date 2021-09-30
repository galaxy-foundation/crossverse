import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import * as requestIp from 'request-ip'
import { login } from '@/utils/datamodel'

export default NextAuth({
  providers: [
    Providers.Credentials({
      id: 'login',
      name: 'login',
      async authorize(credentials, req) {
        const { email, password } = credentials
        const ip = requestIp.getClientIp(req) || ''
        return await login(email, password, ip)
      },
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
    }),
  ],
  secret: process.env.SECRET,
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    secret:
      '++X1rgwp3KiAg5po1g4Q2iaMCjo6DyCzhFi+zCtm0ncn5x1WUKHJiJ7ZqtpzWdpp8pUFpNqsT69GT7mDJYvbBw==',
    signingKey: `{"kty":"oct","kid":"DHRCK0LR7Ak0aTwGvUQ5neKJcP72hMQwMpyTTQp1HO0","alg":"HS256","k":"kQWMTv38YMqVC3k6uznx2OGmd_VLw-peG8T4i6xXa3I"}`,
    verificationOptions: {
      algorithms: ['HS256'],
    },
    encryption: true,
    encryptionKey: `{
      "kty": "oct",
      "kid": "sKeJpco09rLJO3PvJOYAOw8XwYUHvHa8FtPepZEFiqE",
      "use": "enc",
      "alg": "A256GCM",
      "k": "wQRxU6XNXu9OmAvKNa9m0vhXSgj22bsgWK9O48PwKbk"
    }`,
  },
  pages: {
    error: '/auth/error',
  },
  callbacks: {
    async redirect() {
      return '/'
    },
    async session(session: any, userOrToken: any) {
      session.user = { ...userOrToken, id: Number(userOrToken.sub) }
      return Promise.resolve(session)
    },
  },
  events: {},
  theme: 'light',
  debug: true,
})
