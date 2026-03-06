import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.mime.image import MIMEImage

SENDER_EMAIL = "gdgoc.dev@gmail.com"
APP_PASSWORD = os.environ.get("EMAIL_PASSWORD")

def send_email(to_email, image_path):
    try:
        if not APP_PASSWORD:
            print("EMAIL_PASSWORD not set.")
            return

        
        subject = "📸 Your BracketClick Photo is Ready!"
        body = """
        <html>
          <body style="font-family: Arial, sans-serif; line-height:1.6;">

           <img src="cid:header_image" style="width:100%; max-width:600px; border-radius:8px;"><br><br>

           Hi there! 👋<br><br>
 
           Thank you for trying the BracketClick Photo Booth by 
           Google Developer Groups on Campus (GDGoC) — University of Jeddah.<br><br>

           We hope you enjoyed the experience!  
           Your captured photo is attached to this email.<br><br>

           <b>Feel free to share your photo on X and tag us using #GDGUJ</b> — we'd love to see it! 📸 <br><br>

           See you at our next GDGoC event 🚀<br><br>

           Best regards,<br>
           Google Developer Groups on Campus (GDGoC) - AI Committee Team🍅<br>
           University of Jeddah

          </body>
        </html>
        """
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "html"))

        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        header_path = os.path.join(BASE_DIR, "gdg_header.jpeg")

        print("Header path:", header_path)

        with open(header_path, "rb") as f:
            img = MIMEImage(f.read())
            img.add_header("Content-ID", "<header_image>")
            msg.attach(img)

        with open(image_path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())

        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f'attachment; filename="{os.path.basename(image_path)}"'
        )
        msg.attach(part)

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
             server.starttls()
             server.login(SENDER_EMAIL, APP_PASSWORD)
             server.send_message(msg)

        print(f"Email sent successfully to {to_email}")

    except Exception as e:
        print(f"Error sending email: {e}")