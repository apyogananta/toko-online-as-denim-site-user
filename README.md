# Online Clothing Store Customer Frontend

An e-commerce website built with React for selling high-quality secondhand clothes, equipped with a shopping cart, Midtrans payment system, order management, and a user dashboard.

## Features

### Customer Features
- **Product Catalog**: Browse products by categories with search and filtering
- **Product Details**: Detailed product information with image gallery and reviews
- **Shopping Cart**: Add, update, and remove items from cart
- **User Authentication**: Login, register, and password reset functionality
- **Order Management**: Place orders, track status, and view order history
- **Payment Integration**: Secure payment processing with Midtrans
- **Address Management**: Multiple shipping addresses with default selection
- **Product Reviews**: Rate and review purchased products
- **Responsive Design**: Mobile-friendly interface

### Technical Features
- **React 18** with modern hooks and context API
- **React Router** for client-side routing
- **Tailwind CSS** for responsive styling
- **FontAwesome** icons integration
- **Toast notifications** for user feedback
- **Protected routes** for authenticated users
- **Session management** with automatic logout
- **API integration** with Laravel backend
- **Image optimization** and lazy loading

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: FontAwesome
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Notifications**: React Toastify
- **Date Handling**: date-fns
- **Image Processing**: html2canvas
- **Carousel**: React Slick

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Categories.jsx   # Product categories carousel
│   ├── Footer.jsx       # Site footer
│   ├── Navbar.jsx       # Navigation bar
│   ├── ProductItem.jsx  # Product card component
│   └── Route/           # Route protection components
├── context/             # React context providers
│   └── AppContext.jsx   # Global app state management
├── pages/               # Page components
│   ├── Home.jsx         # Homepage
│   ├── Collection.jsx   # Product listing page
│   ├── Product.jsx      # Product detail page
│   ├── Cart.jsx         # Shopping cart page
│   ├── PlaceOrder.jsx   # Checkout page
│   ├── Login.jsx        # Authentication page
│   ├── Dashboard.jsx    # User dashboard
│   ├── Orders.jsx       # Order history
│   └── OrderDetail.jsx  # Order detail page
├── assets/              # Static assets and images
└── main.jsx            # Application entry point
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Laravel backend API running

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WageFolabessy/toko-online-as-denim-site-user.git
cd toko-online-as-denim-site-user
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

5. Start development server:
```bash
npm run dev
```

6. Open browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

This frontend connects to a Laravel backend API. The API endpoints include:

- **Authentication**: `/api/auth/*`
- **Products**: `/api/user/products/*`
- **Cart**: `/api/user/cart/*`
- **Orders**: `/api/user/orders/*`
- **User Management**: `/api/user/*`

Configure the API base URL in `vite.config.js` proxy settings.

## Payment Integration

The project integrates with Midtrans payment gateway for secure payment processing. Configure your Midtrans credentials in the environment variables.

## Key Components

### AppContext
Global state management for:
- User authentication
- Shopping cart state
- API request handling
- Session management

### Protected Routes
- **PrivateRoute**: Requires authentication
- **GuestRoute**: Redirects authenticated users

### Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints
- Touch-friendly interfaces

### Code Style
- ESLint configuration for code quality
- React best practices
- Component-based architecture

### Performance Optimizations
- Lazy loading for images
- Component memoization
- Efficient state updates
- Code splitting
