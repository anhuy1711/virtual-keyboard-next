# Virtual Keyboard Base Project

A modern **Next.js 16** foundation built with **React 19**, **Tailwind CSS v4**, and **TypeScript**. Ready to build your next project with function components and best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
app/
├── components/          # Reusable function components
│   ├── container.tsx   # Layout wrapper
│   ├── hero.tsx        # Hero section
│   ├── feature-card.tsx # Feature card component
│   └── feature-list.tsx # Feature list container
├── layout.tsx          # Root layout
├── page.tsx            # Home page
└── globals.css         # Global Tailwind styles
```

## ✨ Features

- ✅ **Function Components** - All components use modern React function syntax
- ✅ **Tailwind CSS v4** - Utility-first CSS framework pre-configured
- ✅ **TypeScript** - Full type safety out of the box
- ✅ **Dark Mode** - Built-in dark mode support via Tailwind
- ✅ **Next.js 16** - Latest App Router with Server Components
- ✅ **Responsive Design** - Mobile-first approach with Tailwind
- ✅ **ESLint Ready** - Code quality checking configured

## 🛠️ Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📝 JSX Support

You can use both `.tsx` (TypeScript JSX) and `.jsx` (JavaScript JSX) files. The project is configured to support both:

- **TypeScript JSX**: `app/components/my-component.tsx`
- **JavaScript JSX**: `app/components/my-component.jsx`

## 🎨 Customization

### Add New Components

Create a new file in `app/components/`:

```typescriptreact
// app/components/my-component.tsx
export default function MyComponent() {
  return <div>Hello</div>
}
```

Import and use in your pages or other components.

### Tailwind Configuration

Tailwind is pre-configured in `tailwind.config.ts`. Customize theme, colors, and extend utilities as needed.

### Dark Mode

Dark mode is automatically supported. Use Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-zinc-900">
  Content
</div>
```

## 🚀 Deployment

Deploy easily on Vercel:

```bash
npm install -g vercel
vercel
```

Or use any other Node.js hosting platform.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📄 License

MIT
