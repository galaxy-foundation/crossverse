import { google } from 'googleapis'
import { setlog } from './datamodel'

interface GMail {
  mail: string
  auth: any
  token: any
}

class GMail {
  constructor() {
    const mail = 'bitotcglobal'
    const credentials = {
      installed: {
        client_id:
          '658637368444-21bckittnt8tpr5e19q5veqqa4nbjeio.apps.googleusercontent.com',
        project_id: 'galaxy-1607221431560',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_secret: 't36fiF3huMhB9me0BP0RA5Rg',
        redirect_uris: ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost'],
      },
    }
    const token = {
      access_token:
        'ya29.a0AfH6SMDA4KDIs8XFw-VkT9J5LjHrCOJhSAtG2lDioDSkv-fTuz1qFsKmlJG1xsi2mfGL4JK3vzletM0yu6H5UCeKOd0KjacsuMHDQ0ECXf7rJ1uFZ8DSX8ELhkEesj7i-9I0yl4yD5NyIh4yW2sWJ3nKjidBVDzXRZwoJ5DQBC0',
      refresh_token:
        '1//0cL8lhIBZyElcCgYIARAAGAwSNwF-L9IrS4S6RFKpSDFg-MCcbdxvmNbl159KLFudwic-bfYTWvxwwMjeNWvrUykYA20lCiI3xPI',
      scope:
        'https://www.googleapis.com/auth/gmail.modify https://mail.google.com/ https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send',
      token_type: 'Bearer',
      expiry_date: 1607653112680,
    }
    this.init(mail, credentials, token)
  }
  init(mail: string, credentials: any, token: any) {
    try {
      this.mail = mail
      const { client_secret, client_id, redirect_uris } = credentials.installed
      this.auth = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      )
      if (token) this.auth.setCredentials(token)
    } catch (err:any) {
      setlog(err)
    }
  }
  genAuthUrl() {
    try {
      const authUrl = this.auth.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://mail.google.com/',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/gmail.compose',
          'https://www.googleapis.com/auth/gmail.send',
        ],
      })
      return authUrl
    } catch (err:any) {
      setlog(err)
    }
  }
  setAuthCode(code: string) {
    return new Promise((resolve) => {
      this.auth.getToken(code, async (err: any, token: any) => {
        if (err) return resolve(null)
        this.token = token
        resolve(token)
      })
    })
  }
  async send(to: string, subject: string, contents: string) {
    const from = this.mail + '@gmail.com'
    const p = to.indexOf('@')
    if (p === -1) to += '@gmail.com'
    const raw = Buffer.from(
      [
        'Content-Type: text/html; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        'To: ',
        to,
        '\n',
        'From: ',
        from,
        '\n',
        'Subject: ',
        '=?utf-8?B?' + Buffer.from(subject, 'utf8').toString('base64') + '?=',
        '\n\n',
        contents,
      ].join(''),
      'utf8'
    )
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    const gmail = google.gmail({ version: 'v1', auth: this.auth })
    const res = await gmail.users.messages.send({
      // The user's email address. The special value `me` can be used to indicate the authenticated user.
      userId: 'me',
      // Request body metadata
      requestBody: {
        raw,
        // request body parameters
        // {
        //   "historyId": "my_historyId",
        //   "id": "my_id",
        //   "internalDate": "my_internalDate",
        //   "labelIds": [],
        //   "payload": {},
        //   "raw": "my_raw",
        //   "sizeEstimate": 0,
        //   "snippet": "my_snippet",
        //   "threadId": "my_threadId"
        // }
      },
      /* media: {
			  mimeType: 'text/html',
			  body: contents,
			}, */
    })
    console.log(res.data)
  }
}

export default new GMail()
