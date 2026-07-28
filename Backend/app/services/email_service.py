import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging
from email.utils import formatdate

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body_html: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(f"SMTP no configurado. Simulación de envío a {to_email}: {subject}")
        return False
        
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"Sistema de Mentorías SMA <{settings.SMTP_USER}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        msg['Date'] = formatdate(localtime=True)
        
        # Plain text fallback
        text_fallback = "Hola, recibiste una notificación del Sistema de Mentorías SMA. Por favor abre el correo en un cliente que soporte HTML."
        part1 = MIMEText(text_fallback, 'plain')
        part2 = MIMEText(body_html, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Connect to Gmail SMTP over SSL (port 465)
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Error al enviar correo: {str(e)}")
        return False
