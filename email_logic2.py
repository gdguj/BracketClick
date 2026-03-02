import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

SENDER_EMAIL = "ram245531r@gmail.com"
APP_PASSWORD = os.environ.get("EMAIL_PASSWORD")

def send_email(to_email, image_path):
    try:
        if not APP_PASSWORD:
            print("EMAIL_PASSWORD not set.")
            return

        subject = "Your BracketClick Photo 📸"
        body = "Hi!\n\nHere is your captured photo from BracketClick.\n\nEnjoy!🎉"

        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        with open(image_path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())

        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f'attachment; filename="{os.path.basename(image_path)}"'
        )
        msg.attach(part)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())

        print(f"Email sent successfully to {to_email}")

    except Exception as e:
        print(f"Error sending email: {e}")