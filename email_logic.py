import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

# Configuration
sender = "sender@gmail.com" # Change to GCUJ Email
recipient = "receiver@gmail.com" # Can be any domain. Not limited to gmail.com (Make it compatible with frontend)
password = "XXXX" # Enable 2-Steps verifications and Obtain App Password and paste it here.
subject_title = "Sending an email from a Python script"
body_message = "Hi there,\n\nPlease find the attached file.\n\nBest regards!"
file_path = "../../MAS-Chapter 3.pdf" # Path to the attachment

# Create the email (sender, recipient, title)
msg = MIMEMultipart()
msg["From"] = sender
msg["To"] = recipient
msg["Subject"] = subject_title

# Write email content
msg.attach(MIMEText(body_message, "plain"))

# Attaching file (Starts)
with open(file_path, "rb") as f:
    part = MIMEBase("application", "octet-stream")
    part.set_payload(f.read())

encoders.encode_base64(part)
part.add_header(
    "Content-Disposition",
    f'attachment; filename="{os.path.basename(file_path)}"'
)
msg.attach(part)
# Attaching file (Ends)

# Send the email
with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(sender, password)
    server.sendmail(sender, recipient, msg.as_string())

print("Email sent!")