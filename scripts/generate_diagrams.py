import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

diagrams_dir = os.path.abspath('docs/assets/diagrams')
os.makedirs(diagrams_dir, exist_ok=True)

# Common styling
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

def draw_shadow_box(ax, x, y, w, h, bg_color='#ffffff', border_color='#2563eb', title='', items=None, title_color='#1e293b', title_bg='#f1f5f9', rx=0.03):
    # Shadow
    shadow = patches.FancyBboxPatch((x + 0.006, y - 0.008), w, h,
                                    boxstyle=f"round,pad=0.01,rounding_size={rx}",
                                    ec="none", fc="#cbd5e1", alpha=0.5, zorder=1)
    ax.add_patch(shadow)
    # Main box
    box = patches.FancyBboxPatch((x, y), w, h,
                                boxstyle=f"round,pad=0.01,rounding_size={rx}",
                                ec=border_color, fc=bg_color, lw=1.5, zorder=2)
    ax.add_patch(box)
    
    # Title bar
    if title:
        t_box = patches.FancyBboxPatch((x, y + h - 0.05), w, 0.05,
                                      boxstyle=f"round,pad=0.005,rounding_size={rx}",
                                      ec=border_color, fc=title_bg, lw=1, zorder=3)
        ax.add_patch(t_box)
        ax.text(x + w / 2, y + h - 0.026, title, ha='center', va='center',
                fontsize=9.5, fontweight='bold', color=title_color, zorder=4)
    
    # Content items
    if items:
        y_pos = y + h - 0.075
        for item in items:
            ax.text(x + 0.015, y_pos, item, ha='left', va='center',
                    fontsize=8, color='#334155', zorder=4)
            y_pos -= 0.035

def draw_arrow(ax, x1, y1, x2, y2, label='', color='#475569', lw=1.5, label_offset=(0, 0.015)):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=lw, shrinkA=3, shrinkB=3),
                zorder=5)
    if label:
        mx = (x1 + x2) / 2 + label_offset[0]
        my = (y1 + y2) / 2 + label_offset[1]
        ax.text(mx, my, label, ha='center', va='center', fontsize=7.5,
                fontweight='semibold', color=color,
                bbox=dict(boxstyle="round,pad=0.2", fc="#ffffff", ec="#e2e8f0", lw=0.8),
                zorder=6)

# -------------------------------------------------------------
# 1. SYSTEM ARCHITECTURE DIAGRAM
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 7.5), dpi=300)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')

# Main Header
fig.suptitle('PartXChange - Multi-Tier System Architecture', fontsize=15, fontweight='bold', color='#0f172a', y=0.97)
ax.text(0.5, 0.93, 'Client-to-Database End-to-End Component and Cloud Infrastructure Layout',
        ha='center', fontsize=9.5, color='#64748b', style='italic')

# Client Tier (Left)
draw_shadow_box(ax, 0.03, 0.12, 0.26, 0.76, bg_color='#eff6ff', border_color='#3b82f6',
                title='CLIENT TIER (SPA)', title_bg='#dbeafe', title_color='#1d4ed8',
                items=[
                    '• React 18 Single Page App',
                    '• Vite Fast Bundler & Dev Server',
                    '• Tailwind CSS Responsive UI',
                    '• Lucide React Technical Icons',
                    '• Zustand Auth State Manager',
                    '• TanStack React Query Cache',
                    '• Axios HTTP Client',
                    '• Role-Based Guard (RBAC)',
                    '• Client Form Validations'
                ])

# API & Gateway Tier (Center-Left)
draw_shadow_box(ax, 0.35, 0.52, 0.28, 0.36, bg_color='#f8fafc', border_color='#64748b',
                title='API GATEWAY & SECURITY', title_bg='#f1f5f9', title_color='#334155',
                items=[
                    '• Vercel Edge Serverless / Express',
                    '• HTTP-Only Cookie Refresh Token',
                    '• Short-Lived JWT Access Guard',
                    '• Helmet Content Security Policy',
                    '• Express Rate Limit Protection',
                    '• CORS Credentials Handling',
                    '• Pino JSON Audit Logger'
                ])

# Business Logic Tier (Center-Bottom)
draw_shadow_box(ax, 0.35, 0.12, 0.28, 0.36, bg_color='#f0fdf4', border_color='#22c55e',
                title='BACKEND SERVICES TIER', title_bg='#dcfce7', title_color='#15803d',
                items=[
                    '• Authentication Service',
                    '• Listing & Specification Engine',
                    '• 3-Party Escrow & Orders Engine',
                    '• Field Agent Diagnostics Service',
                    '• Cash On Delivery Remittance',
                    '• Admin Ledger & Moderation',
                    '• Zod Runtime Schema Validator'
                ])

# Data Access & Database Tier (Right)
draw_shadow_box(ax, 0.69, 0.52, 0.28, 0.36, bg_color='#faf5ff', border_color='#a855f7',
                title='DATA ACCESS & ORM', title_bg='#f3e8ff', title_color='#7e22ce',
                items=[
                    '• Prisma ORM v5.22 Client',
                    '• Schema Type Generation',
                    '• Transaction Engine ($transaction)',
                    '• Foreign Key Constraints',
                    '• Connection Pooler Config',
                    '• connect_timeout=15s Guard',
                    '• Cloud SSL Verification'
                ])

# Storage & Infrastructure (Right-Bottom)
draw_shadow_box(ax, 0.69, 0.12, 0.28, 0.36, bg_color='#fff7ed', border_color='#f97316',
                title='DATABASE & STORAGE', title_bg='#ffedd5', title_color='#c2410c',
                items=[
                    '• Neon Serverless PostgreSQL',
                    '• AWS us-east-2 Elastic Compute',
                    '• Multi-Tenant Schema Separation',
                    '• 13 Normalized Relational Tables',
                    '• Local / Static Media Directory',
                    '• Automated Backup & Snapshots',
                    '• Zero-Data-Loss Ledger Integrity'
                ])

# Arrows
draw_arrow(ax, 0.29, 0.70, 0.35, 0.70, label='HTTPS / REST', color='#2563eb')
draw_arrow(ax, 0.49, 0.52, 0.49, 0.48, label='Validated Request', color='#16a34a')
draw_arrow(ax, 0.63, 0.30, 0.69, 0.30, label='SQL / Pooler', color='#ea580c')
draw_arrow(ax, 0.49, 0.48, 0.69, 0.70, label='Prisma Invocation', color='#9333ea')
draw_arrow(ax, 0.83, 0.52, 0.83, 0.48, label='Query Execution', color='#7e22ce')

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'architecture-diagram.png'), dpi=300)
plt.close()
print('Architecture diagram saved.')

# -------------------------------------------------------------
# 2. SYSTEM WORKFLOW DIAGRAM (3-WAY ESCROW & INSPECTION)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')

fig.suptitle('PartXChange - 3-Way Verified Escrow & Hardware Inspection Workflow',
             fontsize=14, fontweight='bold', color='#0f172a', y=0.96)
ax.text(0.5, 0.91, 'Step-by-step lifecycle from component listing to physical bench-testing and cash payout',
        ha='center', fontsize=9, color='#64748b', style='italic')

steps = [
    ('1. Listing Creation', '#eff6ff', '#2563eb', [
        'Seller inputs component',
        'specs & condition photos.',
        'Listing published as ACTIVE',
        'or submitted for review.'
    ]),
    ('2. Order & Escrow', '#fefce8', '#ca8a04', [
        'Buyer browses hardware.',
        'Buyer places order (COD).',
        'Item status: RESERVED.',
        'Order status: PLACED.'
    ]),
    ('3. Agent Dispatch', '#f0fdf4', '#16a34a', [
        'Field agent assigned.',
        'Agent visits seller site.',
        'Initial inspection & pickup.',
        'Status: PICKED_UP.'
    ]),
    ('4. Bench Testing', '#faf5ff', '#9333ea', [
        '48-Hour diagnostic tests:',
        'FurMark/Cinebench stress,',
        'voltages, ports & thermals.',
        'INSPECTION_PASSED.'
    ]),
    ('5. Buyer Delivery', '#fff7ed', '#ea580c', [
        'Agent delivers component.',
        'Buyer inspects on site.',
        'Agent collects cash + OTP.',
        'Order: DELIVERED.'
    ]),
    ('6. Cash Remittance', '#fdf2f8', '#db2777', [
        'Agent remits collected cash.',
        'Admin verifies ledger.',
        'Platform commission cut.',
        'Net payout to Seller.'
    ])
]

box_w = 0.14
box_h = 0.55
y_pos = 0.22

for i, (title, bg, border, lines) in enumerate(steps):
    x_pos = 0.03 + i * 0.162
    draw_shadow_box(ax, x_pos, y_pos, box_w, box_h, bg_color=bg, border_color=border,
                    title=title, title_bg=border, title_color='#ffffff', items=lines, rx=0.02)
    if i < len(steps) - 1:
        draw_arrow(ax, x_pos + box_w, y_pos + box_h / 2, x_pos + 0.162, y_pos + box_h / 2,
                   color='#475569', lw=1.5)

# Fallback arrow for failed inspection
ax.annotate('Inspection Failed\n(Return to Seller)',
            xy=(0.03 + box_w/2, y_pos),
            xytext=(0.03 + 3*0.162 + box_w/2, y_pos - 0.08),
            arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.5, connectionstyle="arc3,rad=0.25"),
            fontsize=7.5, fontweight='bold', color="#dc2626", ha='center',
            bbox=dict(boxstyle="round,pad=0.2", fc="#fef2f2", ec="#fca5a5", lw=0.8),
            zorder=6)

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'workflow-diagram.png'), dpi=300)
plt.close()
print('Workflow diagram saved.')

# -------------------------------------------------------------
# 3. USE CASE DIAGRAM
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 8), dpi=300)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')

fig.suptitle('PartXChange - Unified System Use Case Diagram',
             fontsize=14, fontweight='bold', color='#0f172a', y=0.97)
ax.text(0.5, 0.93, 'Role-based capabilities for Buyers, Sellers, Field Verification Agents, and Administrators',
        ha='center', fontsize=9, color='#64748b', style='italic')

# System Boundary Box
sys_box = patches.FancyBboxPatch((0.26, 0.05), 0.48, 0.84,
                                boxstyle="round,pad=0.02,rounding_size=0.03",
                                ec="#3b82f6", fc="#f8fafc", lw=1.8, linestyle='--', zorder=1)
ax.add_patch(sys_box)
ax.text(0.5, 0.865, 'PartXChange Marketplace Application Boundary', ha='center',
        fontsize=10, fontweight='bold', color='#1e3a8a')

def draw_actor(ax, x, y, label, role_color='#2563eb'):
    # Head
    circle = plt.Circle((x, y + 0.05), 0.02, ec=role_color, fc='#ffffff', lw=1.8, zorder=5)
    ax.add_patch(circle)
    # Body
    ax.plot([x, x], [y + 0.03, y - 0.02], color=role_color, lw=1.8, zorder=5)
    # Arms
    ax.plot([x - 0.025, x + 0.025], [y + 0.015, y + 0.015], color=role_color, lw=1.8, zorder=5)
    # Legs
    ax.plot([x, x - 0.02], [y - 0.02, y - 0.05], color=role_color, lw=1.8, zorder=5)
    ax.plot([x, x + 0.02], [y - 0.02, y - 0.05], color=role_color, lw=1.8, zorder=5)
    # Label
    ax.text(x, y - 0.075, label, ha='center', va='center', fontsize=8.5, fontweight='bold',
            color='#0f172a', bbox=dict(boxstyle="round,pad=0.2", fc="#f1f5f9", ec="#cbd5e1", lw=0.8), zorder=5)

def draw_usecase_oval(ax, x, y, text, bg='#ffffff', ec='#2563eb'):
    oval = patches.FancyBboxPatch((x - 0.16, y - 0.028), 0.32, 0.056,
                                  boxstyle="round,pad=0.01,rounding_size=0.025",
                                  ec=ec, fc=bg, lw=1.2, zorder=3)
    ax.add_patch(oval)
    ax.text(x, y, text, ha='center', va='center', fontsize=8, fontweight='medium', color='#1e293b', zorder=4)

# Draw Actors
draw_actor(ax, 0.10, 0.72, 'Buyer\n(Consumer)', role_color='#2563eb')
draw_actor(ax, 0.10, 0.28, 'Seller\n(Hardware Owner)', role_color='#16a34a')
draw_actor(ax, 0.90, 0.72, 'Field Agent\n(Inspector)', role_color='#9333ea')
draw_actor(ax, 0.90, 0.28, 'SuperAdmin\n(Staff)', role_color='#ea580c')

# Use Cases Inside System Boundary
usecases = [
    (0.50, 0.80, 'Browse & Filter PC Hardware', '#dbeafe', '#2563eb'),
    (0.50, 0.72, 'Place Escrow Order with COD', '#dbeafe', '#2563eb'),
    (0.50, 0.64, 'Track Pickup & Inspection Status', '#e0e7ff', '#4f46e5'),
    (0.50, 0.56, 'Publish Listing with Tech Specs', '#dcfce7', '#16a34a'),
    (0.50, 0.48, 'Hardware Bench Testing & Checklist', '#f3e8ff', '#9333ea'),
    (0.50, 0.40, 'Verify Delivery & Verify Buyer OTP', '#f3e8ff', '#9333ea'),
    (0.50, 0.32, 'Cash Collection & Daily Remittance', '#ffedd5', '#ea580c'),
    (0.50, 0.24, 'Moderate Listings & Manage Users', '#ffedd5', '#ea580c'),
    (0.50, 0.16, 'Cash Ledger Reconciliation & Payouts', '#ffedd5', '#ea580c'),
    (0.50, 0.08, 'System Audit Logs & Platform Analytics', '#fee2e2', '#dc2626')
]

for x, y, txt, bg, ec in usecases:
    draw_usecase_oval(ax, x, y, txt, bg=bg, ec=ec)

# Actor-to-UseCase Lines
lines = [
    # Buyer
    ((0.14, 0.72), (0.34, 0.80)),
    ((0.14, 0.72), (0.34, 0.72)),
    ((0.14, 0.72), (0.34, 0.64)),
    # Seller
    ((0.14, 0.28), (0.34, 0.56)),
    ((0.14, 0.28), (0.34, 0.64)),
    # Field Agent
    ((0.86, 0.72), (0.66, 0.48)),
    ((0.86, 0.72), (0.66, 0.40)),
    ((0.86, 0.72), (0.66, 0.32)),
    # Admin
    ((0.86, 0.28), (0.66, 0.24)),
    ((0.86, 0.28), (0.66, 0.16)),
    ((0.86, 0.28), (0.66, 0.08))
]

for (x1, y1), (x2, y2) in lines:
    ax.plot([x1, x2], [y1, y2], color='#94a3b8', lw=1.2, linestyle='-', zorder=2)

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'usecase-diagram.png'), dpi=300)
plt.close()
print('Use case diagram saved.')

# -------------------------------------------------------------
# 4. DATA FLOW DIAGRAM (LEVEL 0 & LEVEL 1 DFD)
# -------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6.5), dpi=300)

for ax in (ax1, ax2):
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')

fig.suptitle('PartXChange - Data Flow Diagrams (Context Level 0 and Functional Level 1)',
             fontsize=13, fontweight='bold', color='#0f172a', y=0.97)

# LEVEL 0 (Left)
ax1.text(0.5, 0.90, 'Level 0 Context Data Flow Diagram', ha='center', fontsize=11, fontweight='bold', color='#1e3a8a')

# Central Process 0.0
circle0 = plt.Circle((0.5, 0.5), 0.15, ec='#2563eb', fc='#eff6ff', lw=2, zorder=3)
ax1.add_patch(circle0)
ax1.text(0.5, 0.52, '0.0\nPartXChange\nMarketplace\nEngine', ha='center', va='center',
         fontsize=8.5, fontweight='bold', color='#1e293b', zorder=4)

# External Entities
entities = [
    (0.12, 0.75, 'Buyer', '#dbeafe', '#1d4ed8'),
    (0.12, 0.25, 'Seller', '#dcfce7', '#15803d'),
    (0.88, 0.75, 'Agent', '#f3e8ff', '#7e22ce'),
    (0.88, 0.25, 'Admin', '#ffedd5', '#c2410c')
]

for ex, ey, lbl, bg, border in entities:
    box = patches.Rectangle((ex - 0.09, ey - 0.05), 0.18, 0.10, ec=border, fc=bg, lw=1.5, zorder=3)
    ax1.add_patch(box)
    ax1.text(ex, ey, lbl, ha='center', va='center', fontsize=9, fontweight='bold', color=border, zorder=4)

# L0 Arrows
draw_arrow(ax1, 0.21, 0.75, 0.38, 0.58, label='Order / Inquiry', color='#2563eb', label_offset=(0, 0.02))
draw_arrow(ax1, 0.21, 0.25, 0.38, 0.42, label='Component Data', color='#16a34a', label_offset=(0, -0.02))
draw_arrow(ax1, 0.62, 0.58, 0.79, 0.75, label='Pickup Task', color='#9333ea', label_offset=(0, 0.02))
draw_arrow(ax1, 0.62, 0.42, 0.79, 0.25, label='Ledger Audit', color='#ea580c', label_offset=(0, -0.02))

# LEVEL 1 DFD (Right)
ax2.text(0.5, 0.90, 'Level 1 Functional Data Flow Decomposition', ha='center', fontsize=11, fontweight='bold', color='#1e3a8a')

processes = [
    (0.28, 0.74, '1.0\nAuth & Access', '#eff6ff', '#2563eb'),
    (0.72, 0.74, '2.0\nListings Engine', '#f0fdf4', '#16a34a'),
    (0.28, 0.42, '3.0\nEscrow Orders', '#faf5ff', '#9333ea'),
    (0.72, 0.42, '4.0\nBench Diagnostics', '#fff7ed', '#ea580c'),
    (0.50, 0.14, '5.0\nCash & Remittance', '#fdf2f8', '#db2777')
]

for px, py, plbl, pbg, pbc in processes:
    circ = plt.Circle((px, py), 0.08, ec=pbc, fc=pbg, lw=1.5, zorder=3)
    ax2.add_patch(circ)
    ax2.text(px, py, plbl, ha='center', va='center', fontsize=7, fontweight='bold', color='#0f172a', zorder=4)

# Data Stores (Parallel lines)
datastores = [
    (0.50, 0.74, 'D1: User Accounts'),
    (0.50, 0.58, 'D2: Product Catalog'),
    (0.50, 0.42, 'D3: Orders & Escrow'),
    (0.50, 0.28, 'D4: Inspection Logs'),
    (0.50, 0.02, 'D5: Cash Ledger')
]

for dx, dy, dlbl in datastores:
    ax2.plot([dx - 0.12, dx + 0.12], [dy + 0.02, dy + 0.02], color='#475569', lw=1.2, zorder=3)
    ax2.plot([dx - 0.12, dx + 0.12], [dy - 0.02, dy - 0.02], color='#475569', lw=1.2, zorder=3)
    ax2.text(dx, dy, dlbl, ha='center', va='center', fontsize=6.8, fontweight='bold', color='#334155', zorder=4)

# Level 1 Connectors
draw_arrow(ax2, 0.28, 0.66, 0.28, 0.50, color='#64748b', lw=1.2)
draw_arrow(ax2, 0.36, 0.42, 0.38, 0.42, color='#64748b', lw=1.2)
draw_arrow(ax2, 0.64, 0.42, 0.62, 0.42, color='#64748b', lw=1.2)
draw_arrow(ax2, 0.72, 0.66, 0.72, 0.50, color='#64748b', lw=1.2)
draw_arrow(ax2, 0.42, 0.14, 0.50, 0.04, color='#64748b', lw=1.2)

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'dfd-diagram.png'), dpi=300)
plt.close()
print('DFD diagram saved.')

# -------------------------------------------------------------
# 5. DATABASE ER DIAGRAM (13 MODELS)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(13, 8.5), dpi=300)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')

fig.suptitle('PartXChange - Normalized Relational Database Schema (Prisma / PostgreSQL)',
             fontsize=14, fontweight='bold', color='#0f172a', y=0.97)
ax.text(0.5, 0.93, 'Complete 13-Model Entity-Relationship Diagram with Foreign Keys & Cardinalities',
        ha='center', fontsize=9, color='#64748b', style='italic')

def draw_table_entity(ax, x, y, w, h, table_name, pk_col, fk_cols, normal_cols, color='#2563eb'):
    # Header
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.005,rounding_size=0.015",
                                ec=color, fc='#ffffff', lw=1.2, zorder=2)
    ax.add_patch(box)
    
    # Title
    t_box = patches.FancyBboxPatch((x, y + h - 0.038), w, 0.038,
                                  boxstyle="round,pad=0.003,rounding_size=0.015",
                                  ec=color, fc=color, lw=1, zorder=3)
    ax.add_patch(t_box)
    ax.text(x + w / 2, y + h - 0.019, table_name, ha='center', va='center',
            fontsize=8.5, fontweight='bold', color='#ffffff', zorder=4)
    
    # Lines
    curr_y = y + h - 0.055
    # PK
    ax.text(x + 0.008, curr_y, f"[PK] {pk_col}", fontsize=6.8, fontweight='bold', color='#b91c1c', zorder=4)
    curr_y -= 0.024
    # FKs
    for fk in fk_cols:
        ax.text(x + 0.008, curr_y, f"[FK] {fk}", fontsize=6.5, fontweight='semibold', color='#2563eb', zorder=4)
        curr_y -= 0.022
    # Normals
    for col in normal_cols:
        ax.text(x + 0.008, curr_y, f"  {col}", fontsize=6.2, color='#475569', zorder=4)
        curr_y -= 0.020

# Row 1 (Top)
draw_table_entity(ax, 0.03, 0.65, 0.17, 0.23, 'User', 'id (CUID)', [], ['email, passwordHash', 'name, phone, role', 'status, area', 'createdAt, updatedAt'], color='#1e40af')
draw_table_entity(ax, 0.23, 0.65, 0.16, 0.23, 'Address', 'id (CUID)', ['userId -> User'], ['line1, line2', 'city, state, pincode', 'phone, isDefault', 'createdAt'], color='#3b82f6')
draw_table_entity(ax, 0.42, 0.65, 0.16, 0.23, 'Category', 'id (CUID)', [], ['name, slug', 'description, icon', 'specSchema (JSON)', 'createdAt'], color='#15803d')
draw_table_entity(ax, 0.61, 0.60, 0.17, 0.28, 'Listing', 'id (CUID)', ['sellerId -> User', 'categoryId -> Category'], ['title, brand, model', 'specs (JSON)', 'condition, price', 'area, status', 'isInspected, createdAt'], color='#16a34a')
draw_table_entity(ax, 0.81, 0.65, 0.16, 0.23, 'ListingImage', 'id (CUID)', ['listingId -> Listing'], ['url (VARCHAR)', 'position (INT)', 'createdAt'], color='#059669')

# Row 2 (Middle)
draw_table_entity(ax, 0.03, 0.32, 0.17, 0.26, 'RefreshToken', 'id (CUID)', ['userId -> User'], ['tokenHash', 'expiresAt', 'revokedAt', 'createdAt'], color='#6b21a8')
draw_table_entity(ax, 0.23, 0.28, 0.17, 0.30, 'Order', 'id (CUID)', ['listingId -> Listing', 'buyerId -> User', 'agentId -> User'], ['status (OrderStatus)', 'itemPrice, deliveryFee', 'commission', 'totalToCollect', 'deliveryAddress (JSON)', 'deliveryOtpHash'], color='#9333ea')
draw_table_entity(ax, 0.43, 0.32, 0.16, 0.26, 'OrderStatusHistory', 'id (CUID)', ['orderId -> Order'], ['status (OrderStatus)', 'note, actorId', 'createdAt'], color='#a855f7')
draw_table_entity(ax, 0.62, 0.30, 0.17, 0.28, 'Inspection', 'id (CUID)', ['orderId -> Order', 'agentId -> User'], ['passed (BOOLEAN)', 'checklist (JSON)', 'stressTestLogs', 'photos (JSON)', 'notes, createdAt'], color='#ea580c')
draw_table_entity(ax, 0.82, 0.32, 0.15, 0.26, 'Review', 'id (CUID)', ['orderId -> Order', 'authorId -> User'], ['rating (INT 1-5)', 'comment', 'createdAt'], color='#d97706')

# Row 3 (Bottom)
draw_table_entity(ax, 0.15, 0.04, 0.18, 0.22, 'CashEntry', 'id (CUID)', ['orderId -> Order', 'agentId -> User'], ['amount, status', 'collectedAt', 'remittedAt, notes'], color='#c2410c')
draw_table_entity(ax, 0.42, 0.04, 0.18, 0.22, 'Payout', 'id (CUID)', ['orderId -> Order', 'sellerId -> User'], ['netAmount, fee', 'method, txRef', 'status, releasedAt'], color='#0284c7')
draw_table_entity(ax, 0.69, 0.04, 0.18, 0.22, 'AuditLog', 'id (CUID)', ['userId -> User'], ['action, entity', 'entityId', 'metadata (JSON)', 'ipAddress, createdAt'], color='#475569')

# Connectors
draw_arrow(ax, 0.11, 0.65, 0.11, 0.58, color='#64748b', lw=1)
draw_arrow(ax, 0.20, 0.76, 0.23, 0.76, color='#64748b', lw=1)
draw_arrow(ax, 0.58, 0.76, 0.61, 0.76, color='#64748b', lw=1)
draw_arrow(ax, 0.78, 0.76, 0.81, 0.76, color='#64748b', lw=1)
draw_arrow(ax, 0.69, 0.60, 0.35, 0.58, color='#64748b', lw=1)
draw_arrow(ax, 0.40, 0.45, 0.43, 0.45, color='#64748b', lw=1)
draw_arrow(ax, 0.40, 0.40, 0.62, 0.40, color='#64748b', lw=1)
draw_arrow(ax, 0.31, 0.28, 0.24, 0.26, color='#64748b', lw=1)
draw_arrow(ax, 0.35, 0.28, 0.47, 0.26, color='#64748b', lw=1)

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'er-diagram.png'), dpi=300)
plt.close()
print('ER diagram saved.')
