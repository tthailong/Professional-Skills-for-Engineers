import smtplib
import ssl
import qrcode
import io
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

# ==============================================================================
# Config EMAIL SERVER (GMAIL)
# ==============================================================================

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = "email.update.ticket@gmail.com" # email gửi vé
SENDER_PASSWORD = "yyfe gzfl amyy dbpg"  # app pass để gửi (giữ nguyên không đổi)


def generate_qr_code(data):
    """
    Hàm tạo QR Code và trả về dưới dạng bytes (để gửi mail không cần lưu file)
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Lưu ảnh vào bộ nhớ tạm (buffer)
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()


def send_ticket_email(receiver_email, ticket_info):
    """
    Hàm gửi vé điện tử
    :param receiver_email: Email người nhận
    :param ticket_info: Dictionary chứa thông tin vé (Tên phim, Ghế, Mã vé...)
    """
    msg = MIMEMultipart('related')
    msg['Subject'] = f"Vé xem phim của bạn: {ticket_info['movie_name']}"
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email

    # Tạo nội dung HTML cho email
    # <img src="cid:qrcode_image"> là để hiển thị ảnh kèm theo
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="border: 1px solid #ddd; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #e50914;">Cảm ơn bạn đã đặt vé!</h2>
            <p>Xin chào <strong>{ticket_info['customer_name']}</strong>,</p>
            <p>Đây là thông tin vé xem phim của bạn:</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #f9f9f9;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phim:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{ticket_info['movie_name']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Suất chiếu:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{ticket_info['showtime']}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Rạp:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{ticket_info['cinema']}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Ghế:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">{ticket_info['seat']}</td>
                </tr>
            </table>

            <div style="text-align: center; margin: 20px 0;">
                <p>Vui lòng đưa mã QR này cho nhân viên soát vé:</p>
                <img src="cid:qrcode_image" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #ccc;">
                <p style="font-size: 12px; color: #777;">Mã vé: {ticket_info['ticket_id']}</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee;">
            <p style="font-size: 12px; text-align: center;">Chúc bạn xem phim vui vẻ!</p>
        </div>
      </body>
    </html>
    """

    # Gán nội dung HTML vào email
    msg_alternative = MIMEMultipart('alternative')
    msg.attach(msg_alternative)
    msg_alternative.attach(MIMEText(html_content, 'html'))

    # Tạo và đính kèm QR Code
    qr_data = f"https://google.com{ticket_info['ticket_id']}"
    qr_image_data = generate_qr_code(qr_data)

    image = MIMEImage(qr_image_data)

    image.add_header('Content-ID', '<qrcode_image>')
    image.add_header('Content-Disposition', 'inline', filename='ticket_qr.png')
    msg.attach(image)

    # Gửi email qua SMTP Gmail
    try:
        # Tạo kết nối bảo mật
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls(context=context)  # Nâng cấp lên kết nối bảo mật TLS
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())

        print(f"✅ Đã gửi vé thành công tới: {receiver_email}")
        return True
    except Exception as e:
        print(f"❌ Lỗi khi gửi mail: {e}")
        return False


# ==============================================================================
# (TEST THỬ)
# ==============================================================================
if __name__ == "__main__":
    # ticket test
    sample_ticket = {
        "ticket_id": "TICKET-2026-XYZ-999",
        "customer_name": "Nguyễn Đại Nhật",
        "movie_name": "Đào, Phở và Piano",
        "showtime": "20:00 - 20/03/2026",
        "cinema": "HCMUT Cinema",
        "seat": "H8, H9"
    }


    send_ticket_email("@gmail.com", sample_ticket) # gmail của khách hàng để gửi
