import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Dark minimalist theme matching the deck
bg_color = '#0e0e14'
card_bg = '#1a1a24'
text_color = '#ffffff'
subtext_color = '#a0a0ab'
accent_coral = '#f24c27'
accent_green = '#10b981'
accent_amber = '#f59e0b'
accent_red = '#ef4444'

def create_statespace_diagram():
    fig, ax = plt.subplots(figsize=(9, 5.5), facecolor=bg_color)
    ax.set_facecolor(bg_color)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    # Root Node
    root = patches.FancyBboxPatch((3.5, 4.8), 3.0, 0.9, boxstyle="round,pad=0.1,rounding_size=0.15",
                                 facecolor=accent_coral, edgecolor='none')
    ax.add_patch(root)
    ax.text(5.0, 5.35, "Root State: Start Search", color='white', fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(5.0, 5.0, "Budget = 180m  |  Target Mood = 7.5", color='white', fontsize=10, ha='center', va='center')

    # Level 1 Nodes
    # Left: Inception
    n1 = patches.FancyBboxPatch((0.5, 2.6), 2.6, 1.0, boxstyle="round,pad=0.1,rounding_size=0.15",
                               facecolor=card_bg, edgecolor=accent_green, linewidth=1.5)
    ax.add_patch(n1)
    ax.text(1.8, 3.25, "Inception (148m)", color='white', fontsize=11, fontweight='bold', ha='center', va='center')
    ax.text(1.8, 2.85, "Rem: 32m | f(n) = 14", color=accent_green, fontsize=9.5, ha='center', va='center')

    # Center: The Prestige
    n2 = patches.FancyBboxPatch((3.7, 2.6), 2.6, 1.0, boxstyle="round,pad=0.1,rounding_size=0.15",
                               facecolor=card_bg, edgecolor=accent_amber, linewidth=1.5)
    ax.add_patch(n2)
    ax.text(5.0, 3.25, "The Prestige (130m)", color='white', fontsize=11, fontweight='bold', ha='center', va='center')
    ax.text(5.0, 2.85, "Rem: 50m | f(n) = 18", color=accent_amber, fontsize=9.5, ha='center', va='center')

    # Right: Oppenheimer (180m)
    n3 = patches.FancyBboxPatch((6.9, 2.6), 2.6, 1.0, boxstyle="round,pad=0.1,rounding_size=0.15",
                               facecolor=card_bg, edgecolor=accent_red, linewidth=1.5)
    ax.add_patch(n3)
    ax.text(8.2, 3.25, "Oppenheimer (180m)", color='white', fontsize=11, fontweight='bold', ha='center', va='center')
    ax.text(8.2, 2.85, "Rem: 0m | Pruned for slot 2", color=accent_red, fontsize=9.5, ha='center', va='center')

    # Arrows Root -> L1
    ax.annotate('', xy=(1.8, 3.7), xytext=(4.2, 4.8), arrowprops=dict(arrowstyle="->", color=accent_green, lw=2))
    ax.annotate('', xy=(5.0, 3.7), xytext=(5.0, 4.8), arrowprops=dict(arrowstyle="->", color=accent_amber, lw=2))
    ax.annotate('', xy=(8.2, 3.7), xytext=(5.8, 4.8), arrowprops=dict(arrowstyle="->", color=accent_red, lw=1.5, linestyle="--"))

    # Level 2 (Goal Solution)
    goal = patches.FancyBboxPatch((2.2, 0.4), 5.6, 1.1, boxstyle="round,pad=0.15,rounding_size=0.2",
                                 facecolor='#064e3b', edgecolor=accent_green, linewidth=2)
    ax.add_patch(goal)
    ax.text(5.0, 1.1, "GOAL STATE REACHED  (A* Heuristic)", color='#34d399', fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(5.0, 0.7, "Optimal 2-Movie Pair: Inception + Short (Total 178m <= 180m)  |  Match: 86%", color='white', fontsize=10.5, ha='center', va='center')

    ax.annotate('', xy=(4.5, 1.6), xytext=(2.2, 2.6), arrowprops=dict(arrowstyle="->", color=accent_green, lw=2))
    ax.annotate('', xy=(5.5, 1.6), xytext=(5.0, 2.6), arrowprops=dict(arrowstyle="->", color=accent_green, lw=2))

    plt.tight_layout()
    plt.savefig('diagram_statespace.png', dpi=200, bbox_inches='tight', facecolor=bg_color)
    plt.close()
    print("Generated diagram_statespace.png")

def create_uninformed_diagram():
    fig, ax = plt.subplots(figsize=(9, 5.5), facecolor=bg_color)
    ax.set_facecolor(bg_color)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    # Header title
    ax.text(5.0, 5.3, "Uninformed Greedy / Static Order Search", color='white', fontsize=14, fontweight='bold', ha='center')
    ax.text(5.0, 4.8, "Tries popular titles sequentially without domain lookahead", color=subtext_color, fontsize=10, ha='center')

    # Step boxes
    steps = [
        ("Step 1", "Pick #1 Top Popular\n(Oppenheimer - 180m)", accent_amber),
        ("Step 2", "Try Next Title\n(The Dark Knight - 152m)", accent_red),
        ("Step 3", "Check Constraint\nTotal = 332m > 180m", accent_red),
        ("Result", "HARD CLASH!\nBacktrack & Undo (4,096+ loops)", accent_red)
    ]

    for i, (title, desc, border_col) in enumerate(steps):
        x = 0.5 + i * 2.35
        card = patches.FancyBboxPatch((x, 1.8), 2.1, 2.2, boxstyle="round,pad=0.1,rounding_size=0.15",
                                     facecolor=card_bg, edgecolor=border_col, linewidth=1.8)
        ax.add_patch(card)
        ax.text(x + 1.05, 3.5, title, color=border_col, fontsize=12, fontweight='bold', ha='center')
        ax.text(x + 1.05, 2.6, desc, color='white', fontsize=10, ha='center', va='center')
        if i < 3:
            ax.annotate('', xy=(x + 2.35, 2.9), xytext=(x + 2.15, 2.9),
                        arrowprops=dict(arrowstyle="->", color=border_col, lw=2))

    # Red undo counter callout
    undo_box = patches.FancyBboxPatch((1.5, 0.4), 7.0, 0.9, boxstyle="round,pad=0.1,rounding_size=0.15",
                                     facecolor='#450a0a', edgecolor=accent_red, linewidth=2)
    ax.add_patch(undo_box)
    ax.text(5.0, 0.85, "UNDO COUNTER: 4,096 backtrack steps | High latency: 120ms", color='#fca5a5', fontsize=11.5, fontweight='bold', ha='center')

    plt.tight_layout()
    plt.savefig('diagram_uninformed.png', dpi=200, bbox_inches='tight', facecolor=bg_color)
    plt.close()
    print("Generated diagram_uninformed.png")

def create_smart_diagram():
    fig, ax = plt.subplots(figsize=(9, 5.5), facecolor=bg_color)
    ax.set_facecolor(bg_color)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    # Header title
    ax.text(5.0, 5.3, "Method 2: A* Search + Forward Checking Pruning", color='white', fontsize=14, fontweight='bold', ha='center')
    ax.text(5.0, 4.8, "Heuristic evaluation + lookahead shrinks remaining domain before branching", color=subtext_color, fontsize=10, ha='center')

    steps = [
        ("Step 1: Heuristic", "f(n) = g(n) + h(n)\nScores mood & genre fit", accent_coral),
        ("Step 2: Forward Checking", "Prunes all films > rem time\nZero invalid branches explored", accent_green),
        ("Step 3: Solution Found", "Optimal combination in 3 steps\nExecution time: 3.8ms", accent_green)
    ]

    for i, (title, desc, border_col) in enumerate(steps):
        x = 0.6 + i * 3.1
        card = patches.FancyBboxPatch((x, 1.8), 2.8, 2.2, boxstyle="round,pad=0.1,rounding_size=0.15",
                                     facecolor=card_bg, edgecolor=border_col, linewidth=2)
        ax.add_patch(card)
        ax.text(x + 1.4, 3.5, title, color=border_col, fontsize=12, fontweight='bold', ha='center')
        ax.text(x + 1.4, 2.6, desc, color='white', fontsize=10.5, ha='center', va='center')
        if i < 2:
            ax.annotate('', xy=(x + 3.1, 2.9), xytext=(x + 2.85, 2.9),
                        arrowprops=dict(arrowstyle="->", color=accent_green, lw=2.5))

    # Fast counter callout
    fast_box = patches.FancyBboxPatch((1.5, 0.4), 7.0, 0.9, boxstyle="round,pad=0.1,rounding_size=0.15",
                                     facecolor='#064e3b', edgecolor=accent_green, linewidth=2)
    ax.add_patch(fast_box)
    ax.text(5.0, 0.85, "EXPANDED STATES: 3 | Latency: 3.8ms | Runtime Violations: 0%", color='#6ee7b7', fontsize=11.5, fontweight='bold', ha='center')

    plt.tight_layout()
    plt.savefig('diagram_smart_astar.png', dpi=200, bbox_inches='tight', facecolor=bg_color)
    plt.close()
    print("Generated diagram_smart_astar.png")

create_statespace_diagram()
create_uninformed_diagram()
create_smart_diagram()
