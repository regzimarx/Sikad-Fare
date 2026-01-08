import qrcode
from PIL import Image, ImageDraw

def generate_sfc_qr_code(data, logo_path, filename="SFC_QR_CODE.png"):
    """
    Generate a stylish QR code with a centered logo.
    This version uses a safer logo size (28%) and a larger QR version for better scanning.
    """

    # Create QR code with larger grid + high error correction
    qr = qrcode.QRCode(
        version=4,  # larger QR grid → more reliable scanning
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=15,
        border=2,
    )

    qr.add_data(data)
    qr.make(fit=True)

    # QR code coloring
    img = qr.make_image(
        fill_color="#1e3a8a",
        back_color="#ffffff"
    ).convert('RGB')

    try:
        logo = Image.open(logo_path)

        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')

        # SAFER LOGO SIZE → 28% of QR width
        qr_width, qr_height = img.size
        logo_size = int(qr_width * 0.28)

        # Resize logo
        logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)

        # White circular background
        circle_size = logo_size + 20
        circle = Image.new('RGBA', (circle_size, circle_size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(circle)
        draw.ellipse([0, 0, circle_size, circle_size], fill='white')

        # Center positions
        logo_x = (qr_width - logo.width) // 2
        logo_y = (qr_height - logo.height) // 2
        circle_x = (qr_width - circle_size) // 2
        circle_y = (qr_height - circle_size) // 2

        # Paste circle + logo
        img.paste(circle, (circle_x, circle_y), circle)
        img.paste(logo, (logo_x, logo_y), logo)

        # Save final QR code
        img.save(filename, quality=95)
        print(f"✓ QR code saved as '{filename}'")
        print(f"✓ QR code links to: {data}")
        return img

    except FileNotFoundError:
        print(f"✗ Error: Logo file '{logo_path}' not found.")
        return None


# ---------------------------
# MAIN PROGRAM
# ---------------------------
if __name__ == "__main__":
    # Original URL with UTM parameters for GA/Firebase tracking
    tracked_url = "https://sikadfare.vercel.app/?utm_source=qr&utm_medium=print&utm_campaign=sfc_qr"

    print("\n============================================")
    print("GENERATING QR CODE")
    print("============================================\n")

    # Generate QR with tracked URL
    print("Generating QR code (tracked URL)...")
    generate_sfc_qr_code(
        data=tracked_url,
        logo_path="tricycle_logo.png",
        filename="SFC_QR_CODE.png"
    )

    print("\n============================================")
    print("✓ DONE! QR code generated:")
    print("  1. SFC_QR_CODE.png          (tracked URL for GA/Firebase)")
    print("============================================\n")
