import { Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ScrollToTop } from "./components/ScrollToTop";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Product from "./pages/Product";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import Dashboard from "./pages/Dashboard";
import Addresses from "./pages/Addresses";
import AccountDetails from "./pages/AccountDetail";
import PrivateRoute from "./components/Route/PrivateRoute";
import GuestRoute from "./components/Route/GuestRoute";
import OrderDetail from "./pages/OrderDetail";
import PaymentSuccess from "./pages/PaymentSucces";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Navbar />
      <SearchBar />
      <ScrollToTop />

      <main className="flex-1 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pt-24 pb-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/place-order"
            element={
              <PrivateRoute>
                <PlaceOrder />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="orders" replace />} />

            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="account" element={<AccountDetails />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
