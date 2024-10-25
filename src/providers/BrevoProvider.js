const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new brevo.TransactionalEmailsApi()

let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY


const sendEmail = async (toEmail, customSubject, customHtmlContent) => {
  // khởi tạo 1 cái sendSmtpEmail với những thông tin cần thiết
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Tài khoảng gửi mail
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Những tài khoảng nhận mail
  //* 'to' phải là một Array đề sau chứng ta có thể tùy phiên gửi 1 email tới nhiều user tây tình năng dự án nhe
  sendSmtpEmail.to = [{ email: toEmail }]

  // Tiêu đề của email
  sendSmtpEmail.subject = customSubject

  // Nội dung email dạng html
  sendSmtpEmail.htmlContent = customHtmlContent

  // Gọi hành động gửi mail, sendTransacEmail return ra 1 Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}


