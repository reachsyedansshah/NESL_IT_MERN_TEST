# Social Network Frontend

A modern React application built with Vite, TypeScript, and cutting-edge tools for the Social Network API.

## 🚀 Features

### **Modern Tech Stack**
- ⚡ **Vite** - Lightning fast build tool
- ⚛️ **React 18** - Latest React with concurrent features
- 🔷 **TypeScript** - Type safety and better DX
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔄 **React Query** - Powerful data fetching and caching
- 🏪 **Zustand** - Lightweight state management
- 🛡️ **Error Boundaries** - Graceful error handling
- 📱 **Responsive Design** - Mobile-first approach

### **Development Experience**
- 🔍 **ESLint** - Code linting and formatting
- 💅 **Prettier** - Consistent code formatting
- 🧪 **Vitest** - Fast unit testing
- 📊 **Test Coverage** - Comprehensive testing
- 🔧 **Hot Module Replacement** - Instant development feedback
- 📦 **Code Splitting** - Optimized bundle sizes

### **Performance Optimizations**
- 🚀 **Lazy Loading** - Route-based code splitting
- 💾 **Intelligent Caching** - React Query caching strategies
- 📦 **Bundle Analysis** - Optimized chunk splitting
- 🎯 **Tree Shaking** - Unused code elimination
- ⚡ **Fast Refresh** - Instant development updates

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Available Scripts

### **Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Testing**
```bash
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run test:run     # Run tests once
```

### **Code Quality**
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

### **Utilities**
```bash
npm run clean        # Clean build artifacts
npm run analyze      # Analyze bundle size
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout component
│   ├── LoadingSpinner.tsx
│   ├── ErrorFallback.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Route components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Posts.tsx
│   └── Profile.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.ts
├── services/           # API services
│   └── api.ts
├── store/              # State management
│   └── useAuthStore.ts
├── lib/                # Library configurations
│   └── queryClient.ts
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── assets/             # Static assets
├── App.tsx             # Main app component
├── AppRoutes.tsx       # Route definitions
└── main.tsx           # App entry point
```

## 🔧 Configuration Files

### **Vite Configuration** (`vite.config.js`)
- Path aliases for clean imports
- Development server with proxy
- Build optimization with code splitting
- Test configuration with coverage
- Preview server settings

### **TypeScript Configuration** (`tsconfig.json`)
- Modern ES2020 target
- Strict type checking
- Path mapping for clean imports
- React JSX support

### **ESLint Configuration** (`.eslintrc.cjs`)
- React-specific rules
- TypeScript support
- Modern JavaScript features
- Code quality enforcement

### **Prettier Configuration** (`.prettierrc`)
- Consistent code formatting
- Tailwind CSS class sorting
- Single quotes and semicolons

## 🎨 Styling

### **Tailwind CSS**
- Utility-first approach
- Responsive design
- Dark mode support
- Custom design system

### **Component Styling**
```tsx
// Example component with Tailwind
const Button: React.FC<ButtonProps> = ({ children, variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};
```

## 🔄 State Management

### **Zustand Store**
```tsx
// Authentication store
const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

### **React Query**
```tsx
// Data fetching with caching
const { data: posts, isLoading } = useQuery({
  queryKey: ['posts', page],
  queryFn: () => postsApi.getPosts(page),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## 🧪 Testing

### **Vitest Configuration**
- Fast test runner
- React Testing Library
- Coverage reporting
- UI for test debugging

### **Test Example**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 🚀 Performance Features

### **Code Splitting**
- Route-based lazy loading
- Component-level splitting
- Vendor chunk optimization

### **Caching Strategy**
- React Query intelligent caching
- Browser cache optimization
- Service worker support (future)

### **Bundle Optimization**
- Tree shaking
- Minification
- Gzip compression
- CDN-ready assets

## 🔒 Security

### **Authentication**
- JWT token management
- Secure token storage
- Automatic token refresh
- Protected routes

### **Error Handling**
- Global error boundaries
- Graceful error recovery
- User-friendly error messages
- Development error details

## 📱 Responsive Design

### **Mobile-First Approach**
- Tailwind responsive utilities
- Touch-friendly interfaces
- Optimized for all screen sizes
- Progressive enhancement

## 🔧 Development Workflow

### **1. Start Development**
```bash
npm run dev
```

### **2. Code Quality Checks**
```bash
npm run lint
npm run format
npm run type-check
```

### **3. Testing**
```bash
npm run test
npm run test:coverage
```

### **4. Build & Deploy**
```bash
npm run build
npm run preview
```

## 🌟 Key Improvements

### **Modern React Patterns**
- Functional components with hooks
- TypeScript for type safety
- Error boundaries for resilience
- Suspense for loading states

### **Developer Experience**
- Hot module replacement
- Fast refresh
- TypeScript IntelliSense
- ESLint + Prettier integration

### **Performance**
- Lazy loading
- Code splitting
- Optimized bundles
- Caching strategies

### **Testing**
- Comprehensive test coverage
- Fast test execution
- Visual test debugging
- Automated testing

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Preview Build**
```bash
npm run preview
```

### **Deploy to Vercel/Netlify**
- Automatic deployments
- Environment variables
- CDN optimization
- SSL certificates

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Built with ❤️ using modern web technologies** 