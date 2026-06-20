# 🎨 BeBrief Studio

A premium, interactive web application designed to help designers structure, prototype, and build stunning Case Study Briefs for Behance. Craft sections, customize color palettes, modify metrics, and export everything directly to standalone HTML, PDF, or high-resolution images.

---

## ⚡ Key Features

* **Live Editor Canvas**: Edit typography, titles, copy, and visual values directly in place on the canvas.
* **Fully Responsive & Scaled Workspace**:
  * **Desktop & Tablet**: Fluid responsive flow layout adjusting automatically to the remaining screen space while keeping properties and sections panels visible.
  * **Mobile View (`< 768px`)**: Locks into a fixed `498px` layout representing a mobile device, automatically scaled down to fit any smartphone viewport without clipping or horizontal overflow.
* **High-Resolution Exports**:
  * Standalone HTML standalone package.
  * High-quality **PNG** and **WEBP** images generated at a standard `1600px` Behance width.
  * Multi-format document **PDF** exports.
* **Dynamic Property Inspector**: Modify section background colors, text colors, paddings, and alignment settings on the fly.
* **State Management**: Built with **Zustand** for lightweight, real-time reactive state updates.
* **Internationalization**: Fully localized interface support.

---

## 🛠️ Technology Stack

* **Core**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS, Lucide React (Icons)
* **State Management**: Zustand
* **Export Utilities**: `html-to-image`, `jspdf`
* **i18n**: `react-i18next`

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn

### Installation

1. Clone or copy this repository to your workspace.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 📝 Changelog

### [v1.1.0] - 2026-06-20

#### 🚀 Added
- **Mobile Locked Layout**: Locked canvas layout width to `498px` on screens below `768px` wide, scaling the canvas dynamically with `transform: scale` so it fits viewports like iPhone/Android without horizontal scrolling.
- **Responsive Tablet/Desktop Flow**: Set default zoom auto-mode to a native `w-full` fluid flow. Canvas content wraps and centers dynamically.
- **Image Export Resolution Locking**: Added forced `1600px` layout rendering during export compilation to ensure high-resolution PNG & WEBP output even when viewing scaled layouts.
- **PWA & Tauri Roadmap**: Drafted detailed setup plans under the `.plans/` directory for progressive web app packaging and desktop app distribution with Tauri.

#### 🔧 Fixed
- **Canvas Scaling Cutoff**: Solved left-edge clipping by introducing a dynamic scaled-size wrapper, replacing `top center` origins with `top left` offsets.
- **Flexbox Sidebar Push**: Added `min-w-0` to the editor's workspace center column, preventing canvas container layout expansion from pushing sidebars off-screen.
- **Inline Text Editing**: Resolved live edit cursor bugs in text nodes on active sections.

#### 🗑️ Chore
- Initialized local Git repository setup.

---

### [v1.0.0] - 2026-06-15

#### 🚀 Added
- Core builder layout featuring dynamic interactive panels: Sections list (left), Editor canvas (center), Property inspector (right).
- Initial section templates: Cover, Overview, Color Palette, Typography, Mockups, Problem, Process, Results, Footer.
- Standalone HTML exporter.
- Multi-language translation setup.
