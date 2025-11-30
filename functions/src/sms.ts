// src/sms.ts
export async function sendAdminSms(phone: string, message: string): Promise<void> {
  console.log(`📱 SMS to ${phone}: ${message}`);
}
