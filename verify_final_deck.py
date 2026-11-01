import pptx

prs = pptx.Presentation('CineMind_AI_Presentation.pptx')
print(f"Presentation has {len(prs.slides)} slides.")

for idx, slide in enumerate(prs.slides):
    print(f"\n==========================================")
    print(f"SLIDE {idx+1}")
    print(f"==========================================")
    
    pictures = [s.name for s in slide.shapes if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE]
    tables = [s.name for s in slide.shapes if s.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.TABLE]
    
    print(f"Pictures: {pictures}")
    if tables:
        print(f"Tables: {tables}")
    
    text_content = []
    font_sizes = []
    for s in slide.shapes:
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                for r in p.runs:
                    txt = r.text.strip()
                    if txt:
                        fs = r.font.size.pt if r.font.size else "inherit"
                        b = "B" if r.font.bold else ""
                        text_content.append(f"{txt} ({fs}pt {b})")
                        if r.font.size:
                            font_sizes.append(r.font.size.pt)
    
    print(f"Font Sizes: min={min(font_sizes) if font_sizes else 'N/A'}, max={max(font_sizes) if font_sizes else 'N/A'}")
    print("Content preview:")
    for item in text_content[:8]:
        print(f"  • {item[:80]}")
