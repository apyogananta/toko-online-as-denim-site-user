import { useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { FiArrowDown } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faInfoCircle,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";

const PlaceOrder = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const { cartItems, authFetch, currency, navigate } = useContext(AppContext);

  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === "number" ? amount : 0;
    return (
      (currency || "Rp ") +
      numericAmount.toLocaleString("id-ID", { minimumFractionDigits: 0 })
    );
  };

  useEffect(() => {
    document.title = "Historich Fleur - Pembayaran";
  }, []);

  useEffect(() => {
    const snapScript =
      import.meta.env.VITE_MIDTRANS_SNAP_URL ||
      "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    if (!clientKey) {
      console.error(
        "Midtrans Client Key missing. Set VITE_MIDTRANS_CLIENT_KEY in .env"
      );
      setFetchError("Konfigurasi pembayaran tidak lengkap.");
      setAddressLoading(false);
      setShippingLoading(false);
      return;
    }

    let scriptTag = document.querySelector(`script[src="${snapScript}"]`);
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.src = snapScript;
      scriptTag.setAttribute("data-client-key", clientKey);
      scriptTag.async = true;
      scriptTag.onload = () => console.log("Midtrans Snap script loaded.");
      scriptTag.onerror = () =>
        console.error("Failed to load Midtrans Snap script.");
      document.body.appendChild(scriptTag);
    } else if (scriptTag.getAttribute("data-client-key") !== clientKey) {
      scriptTag.setAttribute("data-client-key", clientKey);
    }
  }, []);

  const fetchDefaultAddress = useCallback(async () => {
    setAddressLoading(true);
    setFetchError(null);
    setDefaultAddress(null);
    try {
      const response = await authFetch("/api/user/addresses");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Gagal mengambil alamat (${response.status})`
        );
      }
      const data = await response.json();

      const addressesList = data?.data;

      if (addressesList && Array.isArray(addressesList)) {
        const defaultAddr = addressesList.find(
          (addr) => addr.is_default === true
        );
        if (defaultAddr) {
          setDefaultAddress(defaultAddr);
        } else if (addressesList.length > 0) {
          setDefaultAddress(addressesList[0]);
        } else {
          toast.error("Anda belum memiliki alamat pengiriman.");
          navigate("/dashboard/addresses");
        }
      } else {
        throw new Error("Format data alamat tidak valid.");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      if (error.message !== "Unauthorized" && error.message !== "Forbidden") {
        toast.error(error.message || "Kesalahan mengambil data alamat.");
        setFetchError("Gagal memuat data alamat.");
      }
    } finally {
      setAddressLoading(false);
    }
  }, [authFetch, navigate]);

  useEffect(() => {
    fetchDefaultAddress();
  }, [fetchDefaultAddress]);

  const fetchShippingOptions = useCallback(async () => {
    if (!defaultAddress || cartItems.length === 0) {
      setShippingOptions([]);
      return;
    }
    setShippingLoading(true);
    setSelectedShippingOption(null);
    setFetchError(null);
    const totalWeight = cartItems.reduce(
      (total, item) => total + (item.productData?.weight ?? 100) * item.qty,
      0
    );
    if (totalWeight <= 0) {
      setShippingLoading(false);
      return;
    }
    try {
      const destinationIdentifier =
        defaultAddress?.city_id ?? defaultAddress?.postal_code;
      if (!destinationIdentifier) {
        throw new Error(
          "ID/Kode Pos Kota tujuan tidak ditemukan pada alamat default."
        );
      }
      const response = await authFetch("/api/calculate-shipping-cost", {
        method: "POST",
        body: JSON.stringify({
          destination: destinationIdentifier,
          weight: totalWeight,
          courier: "jne:pos:tiki:sicepat:jnt:anteraja",
          price: "lowest",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Gagal opsi pengiriman (${response.status})`
        );
      }
      const data = await response.json();
      setShippingOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shipping options:", error);
      if (error.message !== "Unauthorized" && error.message !== "Forbidden") {
        toast.error(error.message || "Gagal opsi pengiriman.");
        setFetchError(error.message || "Gagal memuat opsi pengiriman.");
      }
      setShippingOptions([]);
    } finally {
      setShippingLoading(false);
    }
  }, [defaultAddress, cartItems, authFetch]);

  useEffect(() => {
    if (defaultAddress && cartItems.length > 0) {
      fetchShippingOptions();
    } else {
      setShippingOptions([]);
    }
    setSelectedShippingOption(null);
  }, [defaultAddress, cartItems, fetchShippingOptions]);

  const onSubmitHandler = async () => {
    setFetchError(null);
    if (
      !defaultAddress ||
      cartItems.length === 0 ||
      !selectedShippingOption ||
      isProcessing ||
      addressLoading ||
      shippingLoading
    ) {
      if (!defaultAddress) toast.error("Alamat pengiriman utama belum diatur.");
      else if (cartItems.length === 0)
        toast.error("Keranjang belanja Anda kosong.");
      else if (!selectedShippingOption)
        toast.error("Silakan pilih metode pengiriman.");
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        cartItems: cartItems.map((item) => ({
          product_id: item.productData.id,
          qty: item.qty,
        })),
        address_id: defaultAddress.id,
        shipping_option: selectedShippingOption,
      };
      const response = await authFetch("/api/midtrans/snap-token", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.snapToken) {
        throw new Error(
          data?.error || data?.message || "Gagal mendapatkan token pembayaran."
        );
      }
      const snapToken = data.snapToken;
      const orderNumber = data.order_id;
      const id = data.id;
      const snapContainerId = "snap-container";
      const snapContainer = document.getElementById(snapContainerId);

      if (!snapContainer) {
        throw new Error(
          "Komponen pembayaran (#snap-container) tidak ditemukan."
        );
      }
      if (window.snap && typeof window.snap.embed === "function") {
        window.snap.embed(snapToken, {
          embedId: snapContainerId,
          onSuccess: function (result) {
            console.log("Payment Success:", result);
            toast.success("Pembayaran berhasil!");
            navigate(`/dashboard/orders/${id || orderNumber}`);
          },
          onPending: function (result) {
            console.log("Payment Pending:", result);
            toast.info("Pembayaran Anda tertunda.");
            navigate(`/dashboard/orders/${id || orderNumber}`);
          },
          onError: function (result) {
            console.error("Payment Error:", result);
            toast.error(
              `Pembayaran gagal: ${result?.status_message || "Silakan coba lagi."
              }`
            );
          },
          onClose: function () {
            console.log("Snap embed closed.");
            toast.warn("Anda menutup jendela pembayaran.", { autoClose: 3000 });
          },
        });
      } else {
        throw new Error("Komponen pembayaran (Snap Embed) belum siap.");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      if (error.message !== "Unauthorized" && error.message !== "Forbidden") {
        toast.error(
          error.message || "Terjadi kesalahan saat memproses pembayaran."
        );
        setFetchError(error.message || "Gagal memproses pembayaran.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-36 min-h-screen bg-gray-50 pb-10">
      <div className="flex flex-col lg:flex-row justify-between gap-8 mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-8 w-full lg:w-2/3">
          <div>
            <Title text1={"Alamat"} text2={"Pengiriman"} />
            {addressLoading ? (
              <div className="border border-gray-200 bg-white p-4 rounded-md mt-4 shadow-sm h-40 flex items-center justify-center text-gray-500">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />{" "}
                Memuat Alamat...
              </div>
            ) : defaultAddress ? (
              <div className="border border-gray-300 bg-white p-4 rounded-md mt-4 shadow-sm text-sm">
                <p className="font-semibold text-gray-800">
                  {defaultAddress.recipient_name}
                </p>
                <p className="text-gray-600">{defaultAddress.phone_number}</p>
                <p className="text-gray-600">{defaultAddress.address_line1}</p>
                {defaultAddress.address_line2 && (
                  <p className="text-gray-600">
                    {defaultAddress.address_line2}
                  </p>
                )}
                <p className="text-gray-600">
                  {" "}
                  {defaultAddress.city}, {defaultAddress.province},{" "}
                  {defaultAddress.postal_code}{" "}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/addresses")}
                  className="mt-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors border border-gray-300"
                >
                  Ganti Alamat Utama
                </button>
              </div>
            ) : (
              <div
                className={`border ${fetchError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                  } p-4 rounded-md mt-4 shadow-sm text-center text-sm`}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                {fetchError || "Alamat utama tidak ditemukan."}
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/addresses")}
                  className="ml-2 text-xs underline font-medium"
                >
                  Atur Alamat
                </button>
              </div>
            )}
          </div>

          <div>
            <Title text1={"Ringkasan"} text2={"Pesanan"} />
            {cartItems.length > 0 ? (
              <div className="border border-gray-300 bg-white rounded-md mt-4 shadow-sm divide-y divide-gray-200">
                {cartItems.map((cartItem) => {
                  const productData = cartItem.productData;
                  if (!productData) return null;
                  return (
                    <div
                      key={cartItem.id}
                      className="p-4 flex items-center gap-4"
                    >
                      <img
                        src={productData.primary_image || "/placeholder.jpg"}
                        alt={productData.name || "Product image"}
                        className="w-16 h-16 object-cover rounded-md shadow flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                      <div className="flex-grow overflow-hidden">
                        <p className="font-medium text-sm sm:text-base text-gray-800 line-clamp-1 truncate">
                          {productData.name}
                        </p>
                        <div className="flex flex-wrap gap-x-2 text-xs text-gray-500">
                          {productData.size && (
                            <span>Ukuran: {productData.size}</span>
                          )}
                          {productData.weight && (
                            <span>Berat: {productData.weight} gr</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {" "}
                          {cartItem.qty} x{" "}
                          {formatCurrency(productData.effective_price)}{" "}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-800 whitespace-nowrap pl-2">
                        {" "}
                        {formatCurrency(
                          productData.effective_price * cartItem.qty
                        )}{" "}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-gray-500 italic">
                Keranjang belanja kosong untuk melanjutkan.
              </p>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/3 space-y-8 mt-8 lg:mt-0">
          <div>
            <Title text1={"Metode"} text2={"Pengiriman"} />
            {defaultAddress && !addressLoading ? (
              <div className="relative mt-4">
                {shippingLoading ? (
                  <div className="mt-4 text-center py-5 border rounded-md bg-white shadow-sm h-40 flex items-center justify-center text-gray-500">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />{" "}
                    Memuat Opsi...
                  </div>
                ) : fetchError && shippingOptions.length === 0 ? (
                  <div className="mt-4 border border-red-200 bg-red-50 p-4 rounded-md shadow-sm text-center text-red-700 text-sm">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    {fetchError}{" "}
                    <button
                      type="button"
                      onClick={fetchShippingOptions}
                      className="ml-2 underline text-xs font-medium"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm divide-y divide-gray-100">
                    {shippingOptions.map((option, index) => (
                      <div
                        key={`${option.code}-${option.service}-${index}`}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedShippingOption === option
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                          }`}
                        onClick={() => setSelectedShippingOption(option)}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="shippingOption"
                            id={`shippingOption-${index}`}
                            value={option.service}
                            checked={selectedShippingOption === option}
                            onChange={() => setSelectedShippingOption(option)}
                            className="mt-1 focus:ring-black text-black flex-shrink-0"
                          />
                          <label
                            htmlFor={`shippingOption-${index}`}
                            className="ml-3 text-sm leading-tight flex-grow cursor-pointer"
                          >
                            <div className="flex justify-between items-center mb-1">
                              {" "}
                              <span className="font-medium text-gray-800 uppercase break-words">
                                {" "}
                                {option.code} - {option.service}{" "}
                              </span>{" "}
                              <span className="text-gray-800 font-semibold whitespace-nowrap pl-2">
                                {" "}
                                {formatCurrency(option.cost)}{" "}
                              </span>{" "}
                            </div>
                            {option.description && (
                              <span className="text-gray-600 text-xs block">
                                {option.description}
                              </span>
                            )}
                            {option.etd && (
                              <span className="text-gray-500 text-xs block">
                                Estimasi:{" "}
                                {option.etd.replace(/hari/gi, "").trim()} Hari
                              </span>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 border border-gray-200 bg-white p-4 rounded-md shadow-sm text-center text-gray-500 text-sm">
                    <FontAwesomeIcon icon={faTruckFast} className="mr-2" />{" "}
                    Tidak ada opsi pengiriman yang tersedia.
                  </div>
                )}
                {shippingOptions.length > 3 &&
                  !shippingLoading &&
                  !fetchError && (
                    <div className="mt-2 flex items-center justify-center text-gray-500 text-xs space-x-1">
                      {" "}
                      <span>Scroll untuk opsi lain</span>{" "}
                      <FiArrowDown className="animate-bounce" />{" "}
                    </div>
                  )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500 italic">
                {" "}
                {addressLoading
                  ? "Memuat alamat..."
                  : "Alamat utama belum dimuat atau diatur."}{" "}
              </p>
            )}
          </div>

          <div className="border border-gray-300 bg-white p-6 rounded-md shadow-sm">
            <CartTotal shippingCost={selectedShippingOption?.cost ?? 0} />
            <div className="w-full text-center mt-6">
              <button
                type="button"
                onClick={onSubmitHandler}
                className={`w-full flex justify-center items-center bg-black text-white px-4 py-3 text-base font-semibold rounded-md transition-colors duration-200 ${!defaultAddress ||
                    cartItems.length === 0 ||
                    !selectedShippingOption ||
                    isProcessing ||
                    addressLoading ||
                    shippingLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  }`}
                disabled={
                  !defaultAddress ||
                  cartItems.length === 0 ||
                  !selectedShippingOption ||
                  isProcessing ||
                  addressLoading ||
                  shippingLoading
                }
              >
                {isProcessing ? (
                  <>
                    {" "}
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="mr-2"
                    />{" "}
                    Memproses...{" "}
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>
              {(!defaultAddress ||
                cartItems.length === 0 ||
                !selectedShippingOption) &&
                !isProcessing &&
                !addressLoading &&
                !shippingLoading && (
                  <p className="text-xs text-red-600 mt-2">
                    Harap lengkapi alamat, isi keranjang, dan pilih pengiriman.
                  </p>
                )}
            </div>
          </div>

          <div
            id="snap-container"
            className="w-full mt-4 min-h-[500px] lg:sticky lg:top-[calc(6rem+15rem)] z-5"
          >
            {isProcessing && !fetchError && (
              <div className="flex justify-center items-center h-full text-gray-500 text-sm pt-10">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />{" "}
                Memuat Pembayaran...
              </div>
            )}
            {fetchError && !isProcessing && (
              <div className="text-center text-red-600 text-sm p-4 border border-red-200 bg-red-50 rounded-md">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />{" "}
                {fetchError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
