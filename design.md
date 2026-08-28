1. 🔤 Typography & Font System
   The frontend imports Google Fonts in
   src/index.css
   and uses a dual-font pairing strategy:

Category Font Family CSS Rule / Applied To Fallbacks
Body & UI Text 'Inter' (300 to 900) Applied globally to body, inputs, buttons, tables, descriptions system-ui, -apple-system, sans-serif
Display / Headings 'Space Grotesk' (400 to 700) h1, h2, h3, h4, .font-display (Headings, logo text, KPI metrics) system-ui, -apple-system, sans-serif
Font Size Scale (Tailwind Scale Used Throughout Codebase)
text-[9px] / text-[10px] (9px–10px): Super-small badges, status tags, overline text, category tags (uppercase tracking-widest).
text-[11px] / text-xs (11px–12px): Navigation links, button labels (sm size), table column headers, helper text, input labels, badge counts.
text-sm (14px): Default button size (md), input values, card body text, subheadings, table row content.
text-base (16px): Large buttons (lg), product card titles, modal titles.
text-lg (18px): Logo initials (CH), product pricing, section sub-headers.
text-xl / text-2xl (20px–24px): Modal headings, secondary hero titles, table section headers.
text-3xl / text-4xl / text-5xl (30px–48px): Hero main headings, auth page banners, KPI numerical metrics. 2. 🎨 Color Palette & Brand Tokens
A. Brand Core & Gradients
Configured via CSS custom variables in
src/index.css
:

Brand Primary Gradient (.bg-brand-gradient):
Default: linear-gradient(135deg, #4f46e5, #7c3aed) (Indigo-600 to Violet-600)
Hover (--brand-gradient-hover): linear-gradient(135deg, #4338ca, #6d28d9) (Indigo-700 to Violet-700)
Brand Glow Shadow (.shadow-brand-glow):
Default: 0 4px 20px -2px rgba(99, 102, 241, 0.45)
Hover: 0 8px 30px -2px rgba(124, 58, 237, 0.5)
Text Gradient (.text-brand-gradient): Clip path with brand gradient on text.
B. Background Colors & Surfaces
Global Page Background: bg-slate-50/60 or bg-slate-50 (Clean modern off-white).
Card & Modal Surface: bg-white and bg-white/90 backdrop-blur-md.
Subtle Containers & Table Headers: bg-slate-50, bg-slate-50/80, bg-slate-100.
Announcement Bar Background: bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950.
Auth Page Background: bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100 with ambient blurred depth blobs (bg-indigo-400/20, bg-violet-400/15).
C. Text Colors & Neutrals (Slate Palette)
Heading / Prominent Text: text-slate-900 (#0f172a)
Body / Secondary Labels: text-slate-700 (#334155) / text-slate-600 (#475569)
Muted / Placeholders / Subtext: text-slate-400 (#94a3b8) / text-slate-500 (#64748b)
White / On-Brand Text: text-white (#ffffff)
D. Semantic & Status Colors
Success / Delivered / Active:
Text & Icons: text-emerald-600 / text-emerald-700
Backgrounds & Badges: bg-emerald-50 / border-emerald-200
Chart Color: #10b981
Warning / Processing / Low Stock / Featured:
Text & Icons: text-amber-600 / text-amber-700
Backgrounds & Badges: bg-amber-50 / border-amber-200
Chart Color: #f59e0b
Error / Out of Stock / Cancelled / Danger:
Text & Icons: text-red-600 / text-rose-600
Backgrounds & Badges: bg-red-50 / border-red-200
Chart Color: #ef4444
Info / Pending / Shipped:
Blue: text-blue-600 / bg-blue-50 / #3b82f6
Purple: text-purple-600 / bg-purple-50 / #8b5cf6 3. 🧩 Component-by-Component Style Breakdown

1. Announcement Bar (
   AnnouncementBar.jsx
   )
   Background: Deep Indigo/Violet gradient (from-indigo-950 via-indigo-900 to-violet-950).
   Text: text-white text-xs font-semibold, with text-indigo-50 font-bold.
   Pills / Badges: bg-white/10 text-amber-300 font-extrabold uppercase text-[11px] rounded-full border border-white/10 backdrop-blur-xs.
   Border: border-b border-indigo-800/40.
2. Main Storefront Navigation Header (
   Navbar.jsx
   )
   Container: sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs h-16.
   Logo: w-10 h-10 rounded-2xl bg-brand-gradient text-white font-black text-lg shadow-brand-glow.
   Search Input: bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500.
   Active Nav Links: bg-brand-gradient text-white font-extrabold shadow-brand-glow rounded-xl text-xs sm:text-sm.
   Inactive Nav Links: text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl.
   Badge Counters (Cart / Wishlist): absolute -top-1.5 -right-1.5 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center (bg-indigo-600 for Cart, bg-violet-600 for Wishlist).
   Dropdown Menu: bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-2.
3. Admin Workspace Header (
   AdminHeader.jsx
   )
   Container: fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs h-16.
   Logo Subtitle: text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest.
   User Profile Chip: w-8 h-8 rounded-full bg-brand-gradient text-white font-black text-xs border border-indigo-200 shadow-xs.
4. Sidebars
   A. Admin Dedicated Sidebar (
   AdminSidebar.jsx
   )
   Dimensions & Position: lg:w-64 bg-white border-r border-slate-200/90 p-4 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:z-30.
   Profile Mini Card: bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 border border-slate-200/90 rounded-2xl p-3 shadow-2xs.
   Active Link: bg-brand-gradient text-white shadow-brand-glow font-extrabold rounded-2xl text-xs px-3.5 py-2.5.
   Inactive Link: text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl text-xs px-3.5 py-2.5.
   Sign Out Button: text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-2xl text-xs font-bold.
   B. Customer Account Sidebar (
   Account/Sidebar.jsx
   )
   Desktop: lg:w-72 xl:w-80 bg-white border-r border-slate-200/90 p-6 lg:fixed lg:left-0 lg:top-16 lg:bottom-0.
   Mobile View: Horizontal swipeable tab bar bg-white border-b border-slate-200/90 px-4 py-2.5 sticky top-16 z-20 with pill badges (rounded-full text-xs font-bold).
5. Buttons (
   Button.jsx
   )
   Variant Styling & Classes Background Border / Shadow
   primary text-white hover:-translate-y-0.5 active:scale-95 focus:ring-indigo-500 .bg-brand-gradient .shadow-brand-glow .shadow-brand-glow-hover
   secondary text-slate-700 hover:bg-slate-200 focus:ring-slate-400 bg-slate-100 border border-slate-200
   danger text-white hover:bg-red-700 focus:ring-red-500 bg-red-600 shadow-sm shadow-red-200
   outline text-slate-700 hover:bg-slate-50 focus:ring-slate-400 bg-transparent border border-slate-300
   Button Size Hierarchy:
   sm: px-3 py-1.5 text-xs font-medium rounded-lg
   md: px-4 py-2.5 text-sm font-semibold rounded-xl
   lg: px-5 py-3 text-base font-semibold rounded-xl
6. Forms & Inputs (
   Input.jsx
   )
   Label: block text-xs font-semibold uppercase tracking-wider text-slate-700.
   Default Input Field: w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all.
   Error Input Field: border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/20 text-red-500.
   Disabled Field: bg-slate-100 cursor-not-allowed opacity-60.
   Toggle Switches: iOS-style pill switch with peer-checked:bg-indigo-600 and smooth white circle knob.
7. Product Cards (
   ProductCard.jsx
   )
   Container: group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200/60 transition-all duration-300 animate-rise-in.
   Image Aspect: aspect-square bg-slate-50 overflow-hidden with group-hover:scale-105 transition-transform duration-500.
   Discount Tag: bg-gradient-to-r from-red-500 to-rose-600 text-white text-[11px] font-black rounded-full px-2.5 py-1.
   Category Pill: bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 text-[10px] font-bold rounded-full.
   Floating Hover Action Buttons: p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 backdrop-blur-md rounded-full shadow-md.
8. KPI & Analytics Cards (
   AdminKPICard.jsx
   )
   Card Container: bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all.
   Glow Accent: Subtle corner radial gradient bg-gradient-to-bl from-[color]-500/10 to-transparent rounded-bl-full.
   Value Display: text-3xl font-black font-display tracking-tight text-slate-900.
   Trend Indicators:
   Positive: bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-black.
   Negative: bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-black.
9. Tables & Data Grids (
   ProductTable.jsx
   ,
   ProductRow.jsx
   )
   Table Wrapper: bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden.
   Header Row: bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500.
   Body Rows: hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0.
   Thumbnails in Table: w-[60px] h-[60px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs.
   Action Buttons: p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl and text-red-500 hover:bg-red-50 rounded-xl.
10. Modals & Overlays (
    CategoryModal.jsx
    ,
    QuickViewModal.jsx
    )
    Backdrop: fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs animate-in fade-in.
    Dialog Container: bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg overflow-hidden max-h-[90vh].
    Header: bg-slate-50/50 border-b border-slate-100 px-6 py-5 flex items-center justify-between.
    Icon Badges in Modal: w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200.
11. Footer (
    Footer.jsx
    )
    Main Area: bg-white border-t border-slate-200/90 text-slate-600 px-5 sm:px-8 py-12 lg:py-16.
    Heading Typography: text-xs font-bold uppercase tracking-wider text-slate-900 font-display.
    Footer Links: text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors.
    Copyright Bottom Bar: border-t border-slate-100 bg-slate-50/50 py-6 text-xs font-medium text-slate-500.
12. 📐 Design Tokens Summary Reference Table
    Design Token Standard Value in Codebase
    Primary Gradient linear-gradient(135deg, #4f46e5, #7c3aed)
    Display Font 'Space Grotesk', system-ui, -apple-system, sans-serif
    Body Font 'Inter', system-ui, -apple-system, sans-serif
    Border Radius Scale rounded-lg (8px) → rounded-xl (12px) → rounded-2xl (16px) → rounded-3xl (24px) → rounded-full
    Shadow Scale shadow-2xs, shadow-xs, shadow-sm, shadow-md, shadow-xl, shadow-2xl, shadow-brand-glow
    Borders border-slate-200/80 or border-slate-200/90 (Soft, refined neutral borders)
    Transitions transition-all duration-200 to duration-300, animate-rise-in
