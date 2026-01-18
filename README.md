# inXource Payments

A modern, secure, and seamless payment processing application built with Next.js 15, TypeScript, and Supabase. Designed for performance and scalability, featuring a responsive UI and robust backend integration.

## 🚀 Features

-   **Order Management**: Complete flow from product selection to checkout and order confirmation.
-   **Product Catalog**: Dynamic product display with image support and customization options.
-   **Secure Payments**: Integrated payment processing supporting multiple methods (Mobile Money, Cash).
-   **Customer & Session Handling**: specialized services for managing customer data and user sessions.
-   **Promotions & Subscriptions**: Built-in support for applying promotions and managing subscription-based services.
-   **Responsive Design**: Mobile-first UI built with Tailwind CSS and Framer Motion for smooth animations.
-   **Real-time Backend**: Powered by Supabase for real-time data fetching and storage.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Backend / Database**: [Supabase](https://supabase.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **State/Popups**: [SweetAlert2](https://sweetalert2.github.io/)
-   **Deployment**: GitHub Actions, Docker/PM2 on VPS

## 📂 Project Structure

```bash
├── app/                # Next.js App Router pages and layouts
├── components/         # Reusable UI components
│   ├── payment/        # Payment-specific components (CheckoutPopup, ProductForm)
│   └── ui/             # Generic UI elements
├── services/           # Business logic and API calls
│   ├── company.ts      # Company & Product data fetching
│   ├── order.ts        # Order processing logic
│   ├── customer.ts     # Customer management
│   └── supabaseClient.ts # Supabase client initialization
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## ⚡ Getting Started

### Prerequisites

-   Node.js (v18+ recommended)
-   pnpm (Package Manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/inXource-payments.git
    cd inXource-payments
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

4.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

This project includes a fully automated CI/CD pipeline for deploying to a VPS.

### VPS Requirements
-   Ubuntu (or compatible Linux distro)
-   Node.js & pnpm installed globally
-   **PM2** for process management
-   **Nginx** (acting as a reverse proxy)

### GitHub Actions Workflow
The `.github/workflows/deploy.yml` file handles the deployment:
1.  **Trigger**: Pushes to `main`.
2.  **Steps**:
    -   Connects via SSH.
    -   Pulls the latest code.
    -   Installs dependencies (including `devDependencies` for Tailwind).
    -   Builds the application (`pnpm run build`).
    -   Restarts the server using PM2.

### Secrets Configuration
To enable deployment, set the following **GitHub Secrets**:
-   `REMOTE_HOST`: VPS IP Address
-   `REMOTE_USER`: SSH Username (e.g., `root`)
-   `SSH_PRIVATE_KEY`: Private SSH Key content

## 📜 Scripts

-   `pnpm dev`: Start development server.
-   `pnpm build`: Build the application for production.
-   `pnpm start`: Start the production server.
-   `pnpm lint`: Run ESLint.
