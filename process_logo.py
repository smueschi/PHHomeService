import sys
from PIL import Image, ImageDraw

def make_circular_transparent(input_path, output_path):
    try:
        # Open the image
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Create a circular mask
        mask = Image.new("L", (width, height), 0)
        draw = ImageDraw.Draw(mask)
        
        # Assume the logo is centered and circular. 
        # We'll take the smaller dimension to define the circle diameter to be safe, 
        # or just use the whole image if it's already cropped close.
        # Let's assume a slight padding to avoid rough edges if the checkerboard touches the logo.
        # But usually these screenshots have the logo in the middle.
        
        # Let's find the center
        center_x, center_y = width // 2, height // 2
        
        # Determine radius. 
        # If we look at the user's upload, the badge touches the edges roughly.
        radius = min(width, height) // 2
        
        # Draw the white circle on the mask (this is what we KEEP)
        # Inset slightly to clip any edge artifacts
        inset = 5 
        draw.ellipse((center_x - radius + inset, center_y - radius + inset, center_x + radius - inset, center_y + radius - inset), fill=255)
        
        # Apply the mask
        result = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        result.paste(img, (0, 0), mask)
        
        # Crop to the bounding box of the non-transparent part
        bbox = result.getbbox()
        if bbox:
            result = result.crop(bbox)
            
        # Save
        result.save(output_path, "PNG")
        print(f"Successfully processed logo to {output_path}")

    except Exception as e:
        print(f"Error processing image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Input: The original uploaded file (with the fake checkerboard)
    input_file = r"C:/Users/User/.gemini/antigravity/brain/371cf2e5-739f-4631-83c8-8334673f7434/uploaded_image_1767526178330.png"
    # Output: The public folder
    output_file = r"c:/Users/User/.gemini/antigravity/scratch/massage/public/logo_ph_home.png"
    
    make_circular_transparent(input_file, output_file)
