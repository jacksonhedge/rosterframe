// Development email capture - logs emails instead of sending
export async function captureEmailForDev(emailData: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  console.log('📧 Email Captured (Dev Mode):');
  console.log('To:', emailData.to);
  console.log('Subject:', emailData.subject);
  console.log('Template:', emailData.template);
  console.log('Data:', emailData.data);
  
  // Store in localStorage or database for testing
  if (typeof window !== 'undefined') {
    const captured = JSON.parse(localStorage.getItem('capturedEmails') || '[]');
    captured.push({
      ...emailData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('capturedEmails', JSON.stringify(captured));
  }
  
  return { success: true, message: 'Email captured in dev mode' };
}