import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  // State
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || null
  );
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const currency = "Rp ";
  const delivery_fee = 0;
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

  const navigate = useNavigate();
  const location = useLocation();
  const inactivityTimerRef = useRef(null);
  const isLoggedOutRef = useRef(false);

  const updateToken = useCallback(
    (newToken) => {
      console.log(
        "[AppContext] Updating token:",
        newToken ? "Token Set" : "Token Removed"
      );
      const previousToken = token;
      isLoggedOutRef.current = false;
      setToken(newToken);
      if (newToken) {
        sessionStorage.setItem("token", newToken);
        if (!previousToken) {
          setCartLoading(true);
        }
      } else {
        sessionStorage.removeItem("token");
        setCartItems([]);
        setCartLoading(false);
      }
    },
    [token]
  );

  const handleLogout = useCallback(
    async (logoutMessage) => {
      if (isLoggedOutRef.current) return;
      console.log("[AppContext] Handling logout...");
      isLoggedOutRef.current = true;
      const currentToken = token || sessionStorage.getItem("token");

      try {
        if (currentToken) {
          await fetch("/api/user/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentToken}`,
              Accept: "application/json",
            },
          });
          console.log("[AppContext] Backend logout API called.");
        }
      } catch (error) {
        console.error("[AppContext] Error calling backend logout API:", error);
      } finally {
        updateToken(null);
        if (location.pathname !== "/login") {
          navigate("/login");
        }
        toast.info(logoutMessage || "Sesi Anda telah berakhir.");
      }
    },
    [navigate, token, updateToken, location.pathname]
  );

  const authFetch = useCallback(
    async (url, options = {}) => {
      const currentToken = sessionStorage.getItem("token");

      if (!currentToken) {
        console.log("[AppContext] No token found in authFetch.");
        if (!isLoggedOutRef.current) {
          handleLogout("Sesi tidak ditemukan. Silakan login kembali.");
        }
        throw new Error("User not authenticated");
      }

      const defaultHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${currentToken}`,
      };
      const mergedOptions = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      };

      try {
        const response = await fetch(url, mergedOptions);
        if (response.status === 401) {
          console.log("[AppContext] Received 401 in authFetch.");
          if (!isLoggedOutRef.current) {
            handleLogout("Sesi Anda tidak valid atau telah berakhir.");
          }
          throw new Error("Unauthorized");
        }
        if (response.status === 403) {
          console.log("[AppContext] Received 403 Forbidden.");
          toast.error("Anda tidak memiliki izin untuk melakukan aksi ini.");
          throw new Error("Forbidden");
        }

        return response;
      } catch (error) {
        console.error("[AppContext] Error in authFetch:", error.message);
        if (
          error.message !== "Unauthorized" &&
          error.message !== "Forbidden" &&
          error.message !== "User not authenticated"
        ) {
          toast.error("Terjadi masalah koneksi jaringan.");
        }
        throw error;
      }
    },
    [handleLogout]
  );

  const fetchCartItems = useCallback(async () => {
    const currentToken = sessionStorage.getItem("token");
    if (!currentToken) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    setCartLoading(true);
    try {
      const response = await authFetch("/api/user/shopping_cart");
      const data = await response.json();

      if (response.ok) {
        if (data && Array.isArray(data.data)) {
          const transformedCartItems = data.data
            .map((item) => ({
              id: item.id,
              qty: item.qty,
              productData: item.product
                ? {
                  id: item.product.id,
                  name: item.product.name,
                  slug: item.product.slug,
                  stock: item.product.stock,
                  stock: item.product.stock,
                  weight: item.product.weight,
                  original_price: item.product.original_price,
                  primary_image:
                    item.product.primary_image || "/placeholder.jpg",
                }
                : null,
            }))
            .filter((item) => item.productData !== null);
          setCartItems(transformedCartItems);
        } else {
          console.warn("[AppContext] Cart data format mismatch:", data);
          setCartItems([]);
        }
      } else {
        console.error("[AppContext] Failed to fetch cart items:", data);
        toast.error(data?.message || "Gagal mengambil data keranjang");
        setCartItems([]);
      }
    } catch (error) {
      console.error(
        "[AppContext] Error fetching cart items (catch block):",
        error.message
      );
      if (
        error.message !== "Unauthorized" &&
        error.message !== "Forbidden" &&
        error.message !== "User not authenticated"
      ) {
        setCartItems([]);
      }
    } finally {
      setCartLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    const currentToken = sessionStorage.getItem("token") || token;
    if (currentToken) {
      console.log("[AppContext] Token exists, fetching initial cart.");
      fetchCartItems();
    } else {
      console.log(
        "[AppContext] No token, ensuring cart is empty and not loading."
      );
      setCartItems([]);
      setCartLoading(false);
    }
  }, [token, fetchCartItems]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    const currentToken = sessionStorage.getItem("token");
    if (currentToken) {
      inactivityTimerRef.current = setTimeout(() => {
        console.log("[AppContext] Inactivity timeout.");
        if (!isLoggedOutRef.current) {
          handleLogout("Sesi Anda telah berakhir karena tidak ada aktivitas.");
        }
      }, INACTIVITY_TIMEOUT);
    }
  }, [handleLogout, INACTIVITY_TIMEOUT]);

  useEffect(() => {
    const currentToken = sessionStorage.getItem("token");
    if (currentToken) {
      const activityEvents = [
        "click",
        "mousemove",
        "keydown",
        "scroll",
        "touchstart",
      ];
      activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, resetInactivityTimer, {
          passive: true,
        });
      });
      resetInactivityTimer(); // Mulai timer

      return () => {
        activityEvents.forEach((eventName) => {
          window.removeEventListener(eventName, resetInactivityTimer);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    } else {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    }
  }, [token, resetInactivityTimer]);

  const addToCart = useCallback(
    async (itemId, quantity = 1, availableStock) => {
      console.log(
        `[AppContext] Adding to cart: Item ${itemId}, Qty: ${quantity}, Stock: ${availableStock}`
      );
      const existingCartItem = cartItems.find(
        (item) => item.productData?.id === itemId
      );
      const currentCartQty = existingCartItem ? existingCartItem.qty : 0;
      const newTotalQty = currentCartQty + quantity;

      if (newTotalQty > availableStock) {
        toast.warn("Stok produk tidak mencukupi.");
        return;
      }
      try {
        const response = await authFetch("/api/user/shopping_cart", {
          method: "POST",
          body: JSON.stringify({ product_id: itemId, qty: quantity }),
        });
        const data = await response.json();
        if (response.ok || response.status === 201) {
          toast.success(data.message || "Produk ditambahkan");
          fetchCartItems(); // Refresh cart
        } else {
          toast.error(data?.message || "Gagal menambahkan produk");
        }
      } catch (error) {
        console.error("[AppContext] Add to cart failed:", error.message);
      }
    },
    [authFetch, fetchCartItems, cartItems]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      console.log(`[AppContext] Removing cart item ${cartItemId}`);
      try {
        const response = await authFetch(
          `/api/user/shopping_cart/${cartItemId}`,
          {
            method: "DELETE",
          }
        );
        let data = {};
        if (response.status !== 204) {
          data = await response.json().catch(() => ({}));
        }
        if (response.ok) {
          toast.success(data?.message || "Produk dihapus");
          fetchCartItems();
        } else {
          toast.error(data?.message || "Gagal menghapus produk");
        }
      } catch (error) {
        console.error("[AppContext] Remove from cart failed:", error.message);
      }
    },
    [authFetch, fetchCartItems]
  );

  const updateQuantity = useCallback(
    async (cartItemId, qty) => {
      console.log(
        `[AppContext] Updating cart item ${cartItemId} to Qty: ${qty}`
      );
      if (qty < 1) {
        console.warn(
          "[AppContext] Invalid quantity (<1) requested for update."
        );
        if (qty <= 0) {
          removeFromCart(cartItemId);
          return;
        }
      }
      try {
        const response = await authFetch(
          `/api/user/shopping_cart/${cartItemId}`,
          {
            method: "PUT",
            body: JSON.stringify({ qty }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "Jumlah diperbarui");
          fetchCartItems();
        } else {
          toast.error(data?.message || "Gagal mengupdate jumlah");
        }
      } catch (error) {
        console.error("[AppContext] Update quantity failed:", error.message);
      }
    },
    [authFetch, fetchCartItems, removeFromCart]
  );

  const getCartCount = () =>
    cartItems.reduce((total, item) => total + item.qty, 0);
  const getCartAmount = () =>
    cartItems.reduce((total, cartItem) => {
      const price = cartItem.productData?.original_price ?? 0;
      return total + price * cartItem.qty;
    }, 0);

  const value = {
    token,
    setToken: updateToken,
    cartItems,
    cartLoading,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    addToCart,
    getCartCount,
    getCartAmount,
    updateQuantity,
    removeFromCart,
    navigate,
    handleLogout,
    authFetch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProvider;
