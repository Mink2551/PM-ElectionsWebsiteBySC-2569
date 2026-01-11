# PM Student Council Elections 2569 🗳️

> A premium, dark-themed election platform for the Student Council 2569 elections.

![Project Preview](/public/hero.png) *Add a screenshot here if available*

## 🌟 Features

### 🎨 Premium Design
- **Dark Mode Enforced**: A sleek, professional dark theme (`#0a0a0f`) with SC Red and PM Pink/Yellow accents.
- **Glassmorphism**: Modern frosted glass effects on cards, headers, and overlays.
- **Animations**: Smooth fade-ins, hover lifts, and pulse effects for an engaging user experience.

### 🗳️ Election Features
- **Live Results**: Real-time vote tracking with animated progress bars.
- **Candidate Profiles**: Detailed pages with policy breakdowns, stats, and biographies.
- **Policy Interaction**: Like/Dislike system for candidate policies with persistent state.
- **Countdown Timer**: 2x2 responsive countdown grid leading up to election day.

### 📱 Responsive & Accessible
- **Mobile First**: Fully responsive layout with a custom mobile sidebar.
- **Cross-Platform**: Optimized for desktop, tablet, and mobile devices.
- **Accessible Navigation**: Clear navigation with hash links (`/#candidates`) for seamless browsing.

### 🛡️ Admin Dashboard
- **Secure Access**: Password-protected admin area (`scadmin1234`).
- **Candidate Management**: Add, remove, and update candidates.
- **Image Cropper**: Integrated pan-and-zoom tool for perfect candidate photo uploads.
- **Vote Management**: Manual vote adjustment capabilities.
- **Live Config**: Toggle Facebook Live streams directly from the admin panel.

### 📸 Dynamic Media
- **Base64 Image Storage**: Candidate images stored directly in database for zero-config setup.
- **Live Stream Integration**: Embed Facebook Live videos on the home page instantly.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS Variables
- **Language**: TypeScript
- **State Persistence**: `js-cookie`
- **Icons**: Material UI Icons
- **Deployment**: Vercel (Recommended)

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Mink2551/PM-ElectionsWebsiteBySC-2569.git
    cd sc-elections-2026
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:3000` to see the application.

## 📂 Project Structure

```bash
src/
├── app/              # Next.js App Router pages
├── components/       # Shared UI components
├── context/          # React Contexts (e.g., Theme - *Removed in v2*)
├── features/         # Feature-specific components (Landing, Navbar, Footer)
├── hooks/            # Custom hooks (useCountdown, etc.)
└── style/            # Global styles and Tailwind directives
```

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#0a0a0f` | Main background |
| **SC Red** | `#EF4444` | Primary actions, gradients |
| **PM Pink** | `#EC4899` | Accents, gradients |
| **PM Yellow** | `#F59E0B` | Accents, highlights |
| **Text** | `#FFFFFF` | Primary text |

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
