# Dev-Time-Capsule

**Dev-Time-Capsule** is an open-source, AI-powered tool that provides deep insights into codebases, accelerates developer onboarding, and surfaces actionable recommendations. Its minimalist Apple-style UI ensures a clean, intuitive experience for developers and auditors alike.

![Landing Page](./LandingPage.jpeg)

---


## Features

- **Project Overview**: High-level project information and stack description.
- **Onboarding**: Step-by-step guide for new developers.
- **Security Analysis**: Identify vulnerabilities and audit readiness.
- **Advisory / Pavilion**: AI-generated recommendations for improvement.
- **Smooth UX**: Animated tab transitions, loaders, and polished typography.
- **Minimalist Design**: Apple-inspired interface with blue primary color.

---

## Tech Stack

- **Frontend**: Next.js 16 (Turbopack), TypeScript, TailwindCSS, Lucide-React icons, Framer Motion
- **Backend**: Next.js API routes powering AI analysis
- **AI Integration**: Gemini API for automated project insights
- **Animations & UI**: Motion-based tab transitions, loaders, and clean typography
- **Deployment**: Compatible with Vercel and any modern Next.js environment

---

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dev-time-capsule.git
cd dev-time-capsule
````

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```env
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── pages/
│   │       └── api/
│   │           └── run-analysis.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   └── ResultView/
│   │       ├── ResultView.tsx
│   │       ├── OverviewTab.tsx
│   │       ├── OnboardingTab.tsx
│   │       ├── SecurityTab.tsx
│   │       └── AdvisoryTab.tsx
│   └── lib/
│       └── api.ts
├── .env
└── package.json
```

---

## Contributing

We welcome contributions!

1. Fork the repository
2. Create a branch (`git checkout -b feature-name`)
3. Make your changes
4. Commit (`git commit -m "Add feature"`)
5. Push (`git push origin feature-name`)
6. Open a pull request

Be sure to follow clean code practices and keep UI/UX consistent with the Apple-inspired style.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Community & Support

* Join the discussion via GitHub Issues
* Submit feature requests or report bugs
* Share improvements with the community

---

## Styling

Use these Tailwind CSS variables for consistent design:

```css
:root {
  --primary: #007aff;   /* Apple blue */
  --success: #28a745;   /* green for audit-ready */
  --gray: #6b7280;      /* neutral text */
  --light-gray: #e5e7eb; 
  --light-bg: #f9f9f9;
}
```

---

## Roadmap

* Real-time AI code feedback
* Sliding tab indicator like iOS
* Dark mode support
* Offline caching for local analysis
* GitHub/GitLab integration for automated PR audits

