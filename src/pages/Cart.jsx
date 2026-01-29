import { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import ProductRecommendations from "./ProductRecommendations";

const Cart = () => {
  useEffect(() => {
    document.title = "historich-fleur - Keranjang";
  }, []);

  const {
    currency,
    cartItems,
    cartLoading,
    updateQuantity,
    removeFromCart,
    navigate,
  } = useContext(AppContext);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  if (cartLoading) {
    return (
      <div className="pt-24 sm:pt-36 px-4 lg:px-20 flex justify-center items-center min-h-[50vh]">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="2x"
          className="text-gray-500"
        />
        <span className="ml-3 text-gray-500">Memuat keranjang...</span>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="pt-24 sm:pt-36 px-4 lg:px-20 text-center">
        <div className="inline-block">
          <Title text1={"Keranjang"} text2={"Anda"} />
        </div>
        <p className="py-10 text-gray-500 text-lg">
          Keranjang belanja Anda masih kosong.
        </p>
        <button
          onClick={() => navigate("/collection")}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  const handleQuantityChange = (itemId, currentQty, stock, inputValue) => {
    const newQty = parseInt(inputValue, 10);
    if (isNaN(newQty)) return;
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.warn(`Stok hanya tersisa ${stock}`, { autoClose: 2000 });
      return;
    }
    if (newQty !== currentQty) {
      setUpdatingItemId(itemId);
      updateQuantity(itemId, newQty).finally(() => setUpdatingItemId(null));
    }
  };

  const handleQuantityBlur = (itemId, stock, event) => {
    const value = event.target.value;
    const currentItem = cartItems.find((item) => item.id === itemId);
    const currentQty = currentItem ? currentItem.qty : 1;
    const newQty = parseInt(value, 10);

    if (value === "" || isNaN(newQty) || newQty < 1) {
      if (currentQty !== 1) {
        setUpdatingItemId(itemId);
        updateQuantity(itemId, 1).finally(() => setUpdatingItemId(null));
      }
    } else if (newQty > stock) {
      if (currentQty !== stock) {
        toast.warn(`Stok hanya ${stock}, jumlah disesuaikan.`, {
          autoClose: 2000,
        });
        setUpdatingItemId(itemId);
        updateQuantity(itemId, stock).finally(() => setUpdatingItemId(null));
      }
    }
  };

  return (
    <div className="border-t pt-24 sm:pt-36 px-4 lg:px-20">
      <div className="mb-10">
        <Title text1={"Keranjang"} text2={"Anda"} />
      </div>

      <div className="divide-y divide-gray-200">
        {cartItems.map((item) => {
          const productData = item.productData;
          if (!productData) {
            console.warn("Item keranjang tanpa data produk valid:", item.id);
            return (
              <div
                key={`error-${item.id}`}
                className="py-4 grid grid-cols-[1fr_auto] gap-4 items-center border-b border-red-200 bg-red-50 px-4 rounded"
              >
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-red-500"
                  />
                  <span>
                    Informasi produk untuk item ini tidak tersedia atau
                    bermasalah.
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Hapus item bermasalah"
                  >
                    <img
                      className="w-5 h-5"
                      src={assets.bin_icon}
                      alt="Hapus"
                    />
                  </button>
                </div>
              </div>
            );
          }

          const isItemUpdating = updatingItemId === item.id;

          return (
            <div
              key={item.id}
              className="py-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] lg:grid-cols-[3fr_1fr_auto] gap-4 md:gap-6 items-center"
            >
              {/* Detail Produk */}
              <div className="flex items-center gap-4">
                <Link to={`/product/${productData.slug}`}>
                  <img
                    className="w-20 h-20 object-cover rounded-md shadow-sm flex-shrink-0 hover:opacity-90"
                    src={productData.primary_image || "/placeholder.jpg"}
                    alt={productData.name || "Gambar Produk"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </Link>
                <div>
                  <Link
                    to={`/product/${productData.slug}`}
                    className="hover:text-blue-600"
                  >
                    <p className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2">
                      {productData.name}
                    </p>
                  </Link>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-700 font-semibold">
                      {currency}
                      {productData.original_price?.toLocaleString("id-ID") ??
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Kuantitas */}
              <div className="flex justify-start md:justify-center items-center relative">
                <input
                  type="number"
                  min={1}
                  max={productData.stock}
                  defaultValue={item.qty}
                  key={`qty-${item.id}-${item.qty}`}
                  onChange={(e) =>
                    handleQuantityChange(
                      item.id,
                      item.qty,
                      productData.stock,
                      e.target.value
                    )
                  }
                  onBlur={(e) =>
                    handleQuantityBlur(item.id, productData.stock, e)
                  }
                  disabled={isItemUpdating}
                  className={`w-16 border border-gray-300 px-2 py-1 rounded text-center focus:outline-none focus:ring-1 focus:ring-black ${isItemUpdating ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  aria-label={`Jumlah untuk ${productData.name}`}
                />
                {isItemUpdating && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="absolute right-[-20px] text-gray-400 text-xs"
                  />
                )}
              </div>
              {/* Tombol Hapus */}
              <div className="flex justify-end">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Hapus item"
                  aria-label={`Hapus ${productData.name} dari keranjang`}
                >
                  <img className="w-5 h-5" src={assets.bin_icon} alt="Hapus" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total & Checkout */}
      <div className="mt-16 flex flex-col items-end">
        <div className="w-full sm:w-auto md:w-[450px] border p-6 rounded-md shadow-md bg-white">
          <CartTotal />
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/place-order")}
              className="w-full bg-black text-white text-sm px-8 py-3 rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              LANJUT KE PEMBAYARAN
            </button>
          </div>
        </div>
      </div>
      <ProductRecommendations></ProductRecommendations>
    </div>
  );
};

export default Cart;
