import pptx
from pptx.util import Pt, Inches
from pptx.dml.color import RGBColor
import os

prs = pptx.Presentation('CampusFlow_FAI_Presentation_v3_choladeck.pptx')

def get_shape(slide, name):
    for s in slide.shapes:
        if s.name == name:
            return s
    return None

def set_text(shape, text, font_size=None, bold=None, color_rgb=None, font_name="Segoe UI"):
    if not shape or not shape.has_text_frame:
        return
    tf = shape.text_frame
    tf.clear()
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = text
    if font_size:
        r.font.size = Pt(font_size)
    if bold is not None:
        r.font.bold = bold
    if font_name:
        r.font.name = font_name
    if color_rgb:
        r.font.color.rgb = color_rgb

def set_paragraphs(shape, paragraphs_data, font_name="Segoe UI"):
    if not shape or not shape.has_text_frame:
        return
    tf = shape.text_frame
    tf.clear()
    for idx, item in enumerate(paragraphs_data):
        text = item[0]
        font_size = item[1] if len(item) > 1 else None
        bold = item[2] if len(item) > 2 else None
        color_rgb = item[3] if len(item) > 3 else None
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        r = p.add_run()
        r.text = text
        if font_size:
            r.font.size = Pt(font_size)
        if bold is not None:
            r.font.bold = bold
        if font_name:
            r.font.name = font_name
        if color_rgb:
            r.font.color.rgb = color_rgb

def replace_or_add_picture(slide, old_shape_name, new_img_path):
    old_shape = get_shape(slide, old_shape_name)
    if not os.path.exists(new_img_path):
        print(f"Image not found: {new_img_path}")
        return
    if old_shape:
        left, top, width, height = old_shape.left, old_shape.top, old_shape.width, old_shape.height
        sp = old_shape._element
        sp.getparent().remove(sp)
    else:
        left, top, width, height = Inches(6.8), Inches(1.5), Inches(6.0), Inches(4.8)
    
    slide.shapes.add_picture(new_img_path, left, top, width, height)

# ==========================================
# SLIDE 1: Title Slide
# ==========================================
s1 = prs.slides[0]
set_text(get_shape(s1, 'Text 0'), "CineMind AI", font_size=62, bold=True)
set_text(get_shape(s1, 'Text 1'), "Intelligent movie discovery and playlist planning using constraint-based AI", font_size=24, bold=False)
set_text(get_shape(s1, 'Text 3'), "Project Team", font_size=22, bold=True)
set_paragraphs(get_shape(s1, 'Text 4'), [
    ("Kirtan Patel", 18, True),
    ("FAI Project Team", 16, False)
])
replace_or_add_picture(s1, 'Image 0', 'screenshot_hero.png')

# ==========================================
# SLIDE 2: Why Picking Movies Hurts Today
# ==========================================
s2 = prs.slides[1]
set_text(get_shape(s2, 'Text 0'), "Why picking a movie hurts today", font_size=40, bold=True)

set_text(get_shape(s2, 'Text 2'), "Endless scrolling", font_size=24, bold=True)
set_text(get_shape(s2, 'Text 3'), "Wandering across multiple streaming apps for 45 minutes without deciding", font_size=17, bold=False)

set_text(get_shape(s2, 'Text 5'), "Mood mismatch", font_size=24, bold=True)
set_text(get_shape(s2, 'Text 6'), "Algorithms push loud action when you are exhausted and need calm", font_size=17, bold=False)

set_text(get_shape(s2, 'Text 8'), "Runtime spillover", font_size=24, bold=True)
set_text(get_shape(s2, 'Text 9'), "A 3-hour movie selected on a weeknight when you only have 90 minutes", font_size=17, bold=False)

set_text(get_shape(s2, 'Text 11'), "Group stalemate", font_size=24, bold=True)
set_text(get_shape(s2, 'Text 12'), "Two viewers on the couch with opposing tastes cannot reach a fair consensus", font_size=17, bold=False)

set_text(get_shape(s2, 'Text 14'), "The Paradox of Choice kills movie night", font_size=30, bold=True)
set_text(get_shape(s2, 'Text 15'), "Manual, slow and frustrating. Exactly the kind of problem AI search is built for.", font_size=18, bold=False)

# ==========================================
# SLIDE 3: One Platform, Three Viewing Contexts
# ==========================================
s3 = prs.slides[2]
set_text(get_shape(s3, 'Text 0'), "One platform, three viewing contexts", font_size=40, bold=True)

set_text(get_shape(s3, 'Text 3'), "Solo Explorer", font_size=26, bold=True)
set_text(get_shape(s3, 'Text 4'), "Calibrate mood dials and available minutes to find your ideal evening match.", font_size=17, bold=False)

set_text(get_shape(s3, 'Text 7'), "Couples & Groups", font_size=26, bold=True)
set_text(get_shape(s3, 'Text 8'), "Adversarial Minimax and Max-Min fairness so neither viewer feels shortchanged.", font_size=17, bold=False)

set_text(get_shape(s3, 'Text 11'), "Marathon Planners", font_size=26, bold=True)
set_text(get_shape(s3, 'Text 12'), "Structured timelines with scheduled dinner breaks, intermissions and curfew limits.", font_size=17, bold=False)

set_text(get_shape(s3, 'Text 13'), "Under the hood, every recommendation is solved as an AI constraint problem.", font_size=20, bold=True)

# ==========================================
# SLIDE 4: Problem Formulation as a CSP
# ==========================================
s4 = prs.slides[3]
set_text(get_shape(s4, 'Text 0'), "Our problem is Search & CSP, like Sudoku", font_size=40, bold=True)

set_text(get_shape(s4, 'Text 3'), "1", font_size=28, bold=True)
set_text(get_shape(s4, 'Text 4'), "What we decide", font_size=24, bold=True)
set_text(get_shape(s4, 'Text 5'), "The exact sequence and titles to watch in a session or marathon", font_size=18, bold=False)

set_text(get_shape(s4, 'Text 8'), "2", font_size=28, bold=True)
set_text(get_shape(s4, 'Text 9'), "Options (Domains)", font_size=24, bold=True)
set_text(get_shape(s4, 'Text 10'), "Catalog of curated films with runtime, mood intensity, genres and ratings", font_size=18, bold=False)

set_text(get_shape(s4, 'Text 13'), "3", font_size=28, bold=True)
set_text(get_shape(s4, 'Text 14'), "Rules that never break", font_size=24, bold=True)
set_text(get_shape(s4, 'Text 15'), "Total runtime <= budget, audience safety filters respected, no repeated titles", font_size=18, bold=False)

set_text(get_shape(s4, 'Text 17'), "Constraint Satisfaction Problem (CSP): maximize satisfaction, never violate bounds. Sudoku is the classic example.", font_size=20, bold=True)

# ==========================================
# SLIDE 5: Graph & State-Space Formulation
# ==========================================
s5 = prs.slides[4]
set_text(get_shape(s5, 'Text 0'), "Every movie is a state, every transition a choice", font_size=40, bold=True)
set_text(get_shape(s5, 'Text 1'), "State-Space Formulation", font_size=26, bold=True)
set_paragraphs(get_shape(s5, 'Text 2'), [
    ("Node: A movie state with runtime, mood score, and genre profile", 18, False),
    ("Edge: Sequencing transition evaluating narrative pacing and emotional shift", 18, False),
    ("Goal: High-satisfaction playlist that strictly fits within your time budget", 18, False)
])
set_text(get_shape(s5, 'Text 3'), "Illustrative search space: candidate catalog pruned via forward checking and heuristic distance.", font_size=15, bold=False)
replace_or_add_picture(s5, 'Image 0', 'diagram_statespace.png')

# ==========================================
# SLIDE 6: What CineMind AI Checks
# ==========================================
s6 = prs.slides[5]
set_text(get_shape(s6, 'Text 0'), "What CineMind AI checks", font_size=40, bold=True)

set_text(get_shape(s6, 'Text 3'), "Does it fit the time budget?", font_size=24, bold=True)
set_text(get_shape(s6, 'Text 4'), "Total runtime fits your available evening window without curfew spillover", font_size=17, bold=False)

set_text(get_shape(s6, 'Text 7'), "Does it match emotional mood?", font_size=24, bold=True)
set_text(get_shape(s6, 'Text 8'), "Fuzzy membership validates continuous mood: chill, energetic, or intense", font_size=17, bold=False)

set_text(get_shape(s6, 'Text 11'), "Does it satisfy audience safety?", font_size=24, bold=True)
set_text(get_shape(s6, 'Text 12'), "Hard constraint domain pruning removes violence and adult content for families", font_size=17, bold=False)

set_paragraphs(get_shape(s6, 'Text 13'), [
    ("All pass: playlist confirmed, confidence scored.   Clash: valid substitutes suggested.", 18, True)
])
replace_or_add_picture(s6, 'Picture 21', 'screenshot_discover.png')

# ==========================================
# SLIDE 7: Live System Demonstration
# ==========================================
s7 = prs.slides[6]
# Clear shape 1 instruction text
t2 = get_shape(s7, 'Text 2')
if t2 and t2.has_text_frame:
    t2.text_frame.clear()

replace_or_add_picture(s7, 'image placeholder', 'screenshot_watchlist.png')

set_text(get_shape(s7, 'Text 4'), "P1", font_size=18, bold=True)
set_text(get_shape(s7, 'Text 5'), "Discovery Studio", font_size=22, bold=True)
set_text(get_shape(s7, 'Text 6'), "Mood dial calibration, time budget constraints, and free public internet search", font_size=16, bold=False)

set_text(get_shape(s7, 'Text 8'), "P2", font_size=18, bold=True)
set_text(get_shape(s7, 'Text 9'), "Marathon Scheduler", font_size=22, bold=True)
set_text(get_shape(s7, 'Text 10'), "Temporal goal-stack scheduling with meal intervals and reactive replanning on drop-off", font_size=16, bold=False)

set_text(get_shape(s7, 'Text 12'), "P3", font_size=18, bold=True)
set_text(get_shape(s7, 'Text 13'), "Couch War Consensus", font_size=22, bold=True)
set_text(get_shape(s7, 'Text 14'), "Adversarial Minimax with alpha-beta pruning resolving two-viewer stalemates", font_size=16, bold=False)

# Add slide title to slide 7
title_box = s7.shapes.add_textbox(Inches(0.6), Inches(0.4), Inches(12.1), Inches(0.8))
title_tf = title_box.text_frame
title_p = title_tf.paragraphs[0]
title_r = title_p.add_run()
title_r.text = "Live System Demonstration & Key Workflows"
title_r.font.size = Pt(40)
title_r.font.bold = True
title_r.font.name = "Segoe UI"

# ==========================================
# SLIDE 8: Method 1 (Baseline: Uninformed Search)
# ==========================================
s8 = prs.slides[7]
set_text(get_shape(s8, 'Text 0'), "Method 1: popularity & greedy genre sorting", font_size=40, bold=True)
set_text(get_shape(s8, 'Text 2'), "Baseline: uninformed search", font_size=18, bold=True)
set_paragraphs(get_shape(s8, 'Text 3'), [
    ("Take highest-rated titles in static list order", 18, False),
    ("First popular title wins", 18, False),
    ("No foresight: a 3-hour drama ruins a relaxing Sunday night", 18, False),
    ("Many earlier choices are manually skipped by the user", 18, False)
])
set_text(get_shape(s8, 'Text 4'), "Watch the bounce rate and decision fatigue grow.", font_size=20, bold=True)
replace_or_add_picture(s8, 'Image 0', 'diagram_uninformed.png')

# ==========================================
# SLIDE 9: Method 2 (Heuristic Search & Forward Checking)
# ==========================================
s9 = prs.slides[8]
set_text(get_shape(s9, 'Text 0'), "Method 2: A* Search + Forward Checking", font_size=40, bold=True)

set_text(get_shape(s9, 'Text 2'), "1", font_size=24, bold=True)
set_text(get_shape(s9, 'Text 3'), "Heuristic Evaluation", font_size=22, bold=True)
set_text(get_shape(s9, 'Text 4'), "f(n) = g(n) + h(n) prioritizes titles that minimize cumulative mood mismatch", font_size=16, bold=False)

set_text(get_shape(s9, 'Text 6'), "2", font_size=24, bold=True)
set_text(get_shape(s9, 'Text 7'), "Forward Checking", font_size=22, bold=True)
set_text(get_shape(s9, 'Text 8'), "When movie 1 is chosen, instantly prune candidate films exceeding remaining minutes", font_size=16, bold=False)

set_text(get_shape(s9, 'Text 10'), "3", font_size=24, bold=True)
set_text(get_shape(s9, 'Text 11'), "Simulated Annealing", font_size=22, bold=True)
set_text(get_shape(s9, 'Text 12'), "Freeze favorites and stochastically explore better substitutes using cooling schedule", font_size=16, bold=False)
replace_or_add_picture(s9, 'Image 0', 'diagram_smart_astar.png')

# ==========================================
# SLIDE 10: Benchmark Table & Measurements
# ==========================================
s10 = prs.slides[9]
set_text(get_shape(s10, 'Text 0'), "Same input, two solvers, measured", font_size=40, bold=True)

table_shape = get_shape(s10, 'Table 0')
if table_shape and table_shape.has_table:
    tbl = table_shape.table
    table_data = [
        ["Evaluation Metric", "Popularity Baseline", "CineMind AI (A* + CSP)"],
        ["Execution time", "120 ms (Unbounded)", "3.8 ms (Guaranteed)"],
        ["States / Choices tried", "4,096 combinations", "3 to 12 states"],
        ["Runtime violations", "Frequent (> 40%)", "0% (Strictly zero)"],
        ["Calibrated match score", "58% average fit", "86% optimized fit"]
    ]
    for row_idx, row in enumerate(tbl.rows):
        for col_idx, cell in enumerate(row.cells):
            cell.text = table_data[row_idx][col_idx]
            for p in cell.text_frame.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(18 if row_idx == 0 else 16)
                    r.font.bold = (row_idx == 0 or col_idx == 2)
                    r.font.name = "Segoe UI"

set_text(get_shape(s10, 'Text 2'), "How we test", font_size=24, bold=True)
set_paragraphs(get_shape(s10, 'Text 3'), [
    ("500+ curated movie candidate catalog", 18, False),
    ("Varying time budgets (90m, 180m, 300m) and mood targets", 18, False),
    ("Identical inputs and constraints for both solvers", 18, False)
])
set_text(get_shape(s10, 'Text 4'), "As the candidate space grows, heuristic A* with forward checking remains sub-5ms.", font_size=19, bold=True)

# ==========================================
# SLIDE 11: Real-World Handling (Reactive Replanning)
# ==========================================
s11 = prs.slides[10]
set_text(get_shape(s11, 'Text 0'), "Viewer dropped off? Reactive replanning", font_size=40, bold=True)

# Clear screenshot placeholder text
t19 = get_shape(s11, 'Text 19')
if t19 and t19.has_text_frame:
    t19.text_frame.clear()

set_text(get_shape(s11, 'Text 2'), "Movie skipped", font_size=22, bold=True)
set_text(get_shape(s11, 'Text 3'), "User skips a planned title in marathon", font_size=16, bold=False)

set_text(get_shape(s11, 'Text 6'), "Timeline broken", font_size=22, bold=True)
set_text(get_shape(s11, 'Text 7'), "Schedule gap & curfew constraint at risk", font_size=16, bold=False)

set_text(get_shape(s11, 'Text 10'), "Alternatives shown", font_size=22, bold=True)
set_text(get_shape(s11, 'Text 11'), "k-NN substitute fitted to remaining time", font_size=16, bold=False)

set_text(get_shape(s11, 'Text 14'), "Timeline repaired", font_size=22, bold=True)
set_text(get_shape(s11, 'Text 15'), "Marathon finishes right on schedule", font_size=16, bold=False)

set_text(get_shape(s11, 'Text 17'), "In AI terms: drop-off triggers dynamic goal-stack replanning. The solver repairs the timeline in real time without invalidating previous slots.", font_size=19, bold=True)
replace_or_add_picture(s11, 'Picture 27', 'screenshot_planner.png')

# ==========================================
# SLIDE 12: Group Decision & Game Theory (Couch War)
# ==========================================
s12 = prs.slides[11]
set_text(get_shape(s12, 'Text 0'), "Couch War: 2-Player Minimax with Alpha-Beta", font_size=40, bold=True)

# Clear placeholder text
t15 = get_shape(s12, 'Text 15')
if t15 and t15.has_text_frame:
    t15.text_frame.clear()

set_text(get_shape(s12, 'Text 3'), "Player 1 (Alex - Max)", font_size=24, bold=True)
set_text(get_shape(s12, 'Text 4'), "Seeks high-adrenaline stimulation (Sci-Fi, Action). Maximizes exciting payoff.", font_size=17, bold=False)

set_text(get_shape(s12, 'Text 7'), "Player 2 (Sam - Min)", font_size=24, bold=True)
set_text(get_shape(s12, 'Text 8'), "Prefers thoughtful mystery and comedy. Minimizes unwanted violence.", font_size=17, bold=False)

set_text(get_shape(s12, 'Text 11'), "Minimax Equilibrium", font_size=24, bold=True)
set_text(get_shape(s12, 'Text 12'), "Game tree evaluated with alpha-beta pruning to find movies neither player vetoes.", font_size=17, bold=False)

set_text(get_shape(s12, 'Text 13'), "Why: adversarial game theory mathematically resolves group debate without arguments.", font_size=19, bold=True)
replace_or_add_picture(s12, 'Picture 21', 'screenshot_couchwar.png')

# ==========================================
# SLIDE 13: Closing Slide
# ==========================================
s13 = prs.slides[12]
set_text(get_shape(s13, 'TextBox 3'), "Thank you", font_size=72, bold=True)

# Add subtitle
sub_box = s13.shapes.add_textbox(Inches(7.47), Inches(4.4), Inches(5.5), Inches(1.5))
sub_tf = sub_box.text_frame
sub_p = sub_tf.paragraphs[0]
sub_r = sub_p.add_run()
sub_r.text = "CineMind AI\nIntelligent Cinema Discovery & Planning Platform"
sub_r.font.size = Pt(22)
sub_r.font.bold = True
sub_r.font.name = "Segoe UI"

# ==========================================
# SLIDE 14: Conclusion / Summary
# ==========================================
s14 = prs.slides[13]
set_text(get_shape(s14, 'Text 0'), "Solved with Classical AI", font_size=56, bold=True)

# Add 4 core foundations summary box
summary_box = s14.shapes.add_textbox(Inches(0.8), Inches(3.6), Inches(7.5), Inches(3.2))
summary_tf = summary_box.text_frame
summary_tf.word_wrap = True

foundations = [
    ("1. A* State-Space Search:", " Heuristic f(n) = g(n) + h(n) optimizes mood curve and duration."),
    ("2. CSP with Forward Checking:", " Prunes future domains the moment a movie is picked."),
    ("3. Simulated Annealing:", " Stochastic local search refines playlists without local ruts."),
    ("4. 2-Player Minimax with Alpha-Beta:", " Game-theoretic consensus for multi-viewer couch wars.")
]

for idx, (title, desc) in enumerate(foundations):
    p = summary_tf.paragraphs[0] if idx == 0 else summary_tf.add_paragraph()
    p.space_after = Pt(10)
    r1 = p.add_run()
    r1.text = title
    r1.font.bold = True
    r1.font.size = Pt(18)
    r1.font.name = "Segoe UI"
    r2 = p.add_run()
    r2.text = desc
    r2.font.bold = False
    r2.font.size = Pt(17)
    r2.font.name = "Segoe UI"

prs.save('CineMind_AI_Presentation.pptx')
print("Successfully generated final CineMind_AI_Presentation.pptx with all enlarged fonts and custom diagrams!")
