import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationCircle,
  faCopy,
  faPrint,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const OrderDetail = () => {
  const { authFetch, currency } = useContext(AppContext);
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === "number" ? amount : 0;
    return (
      (currency || "Rp ") +
      numericAmount.toLocaleString("id-ID", { minimumFractionDigits: 0 })
    );
  };

  useEffect(() => {
    document.title = `Historich Fleur - Detail Order`;
  }, []);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await authFetch(`/api/user/user_orders/${orderId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("Pesanan tidak ditemukan.");
        }
        throw new Error(
          errorData?.message ||
          `Gagal mengambil detail pesanan (${response.status})`
        );
      }

      const data = await response.json();
      const orderData = data?.data || data;

      if (
        orderData &&
        orderData.id &&
        orderData.order_number &&
        Array.isArray(orderData.items)
      ) {
        setOrder(orderData);
        document.title = `Historich Fleur - Order ${orderData.order_number}`;
      } else {
        throw new Error("Format data detail pesanan tidak valid.");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      if (err.message !== "Unauthorized" && err.message !== "Forbidden") {
        setError(
          err.message || "Terjadi kesalahan saat mengambil detail pesanan."
        );
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError("ID Pesanan tidak valid.");
      setLoading(false);
    }
  }, [orderId, fetchOrder]);

  const copyTrackingNumber = () => {
    if (order?.shipment?.tracking_number) {
      navigator.clipboard
        .writeText(order.shipment.tracking_number)
        .then(() => toast.success("Nomor resi berhasil disalin"))
        .catch((err) => {
          console.error("Gagal menyalin resi:", err);
          toast.error("Gagal menyalin nomor resi.");
        });
    }
  };

  const downloadInvoice = () => {
    const invoiceElement = invoiceRef.current;
    if (!invoiceElement) return;

    const confirmationButton = invoiceElement.querySelector(".confirm-button");
    const elementsToHide = invoiceElement.querySelectorAll(".hide-on-print");

    const originalDisplayConfirm = confirmationButton
      ? confirmationButton.style.display
      : "";
    const originalVisibilityHide = Array.from(elementsToHide).map(
      (el) => el.style.visibility
    );

    if (confirmationButton) confirmationButton.style.display = "none";
    elementsToHide.forEach((el) => (el.style.visibility = "hidden"));

    const storeNameEl = document.createElement("h1");
    storeNameEl.textContent = "Historich Fleur";
    storeNameEl.className = "text-center text-2xl font-bold mb-6 pt-4";
    invoiceElement.prepend(storeNameEl);

    html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = `Nota_ASDenim_${order?.order_number || orderId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      })
      .catch((err) => {
        console.error("Gagal mengunduh nota (html2canvas):", err);
        toast.error("Gagal membuat file nota.");
      })
      .finally(() => {
        if (invoiceElement.contains(storeNameEl)) {
          invoiceElement.removeChild(storeNameEl);
        }
        if (confirmationButton)
          confirmationButton.style.display = originalDisplayConfirm;
        elementsToHide.forEach(
          (el, index) => (el.style.visibility = originalVisibilityHide[index])
        );
      });
  };

  const handleConfirmReceived = async () => {
    if (
      !order ||
      !order.shipment ||
      isConfirming ||
      order.shipment.status !== "shipped"
    ) {
      return;
    }

    setIsConfirming(true);

    try {
      const response = await authFetch(
        `/api/user/user_orders/${order.id}/confirm-received`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Konfirmasi pesanan diterima berhasil.");
        setOrder((prevOrder) => ({
          ...prevOrder,
          shipment: {
            ...prevOrder.shipment,
            status: "delivered",
          },
        }));
      } else {
        if (
          (response.status === 400 || response.status === 200) &&
          data.message?.includes("sudah ditandai")
        ) {
          toast.info(data.message || "Status pesanan tidak dapat diubah.");
          fetchOrder();
        } else if (response.status === 403) {
          toast.error(data.message || "Akses ditolak.");
        } else if (response.status === 404) {
          toast.error(data.message || "Data pengiriman tidak ditemukan.");
        } else {
          toast.error(data.message || "Gagal mengonfirmasi pesanan.");
        }
        console.error("Confirmation error response:", {
          status: response.status,
          body: data,
        });
      }
    } catch (err) {
      console.error("Error confirming order received:", err);
      toast.error("Terjadi kesalahan jaringan saat mengonfirmasi pesanan.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center min-h-[300px] flex justify-center items-center">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="lg"
          className="text-gray-400"
        />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
        {error || "Gagal memuat detail pesanan."}{" "}
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="ml-3 text-xs text-blue-600 underline"
        >
          Kembali ke Daftar Pesanan
        </button>
      </div>
    );
  }

  const canConfirm = order.shipment && order.shipment.status === "shipped";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-10">
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Detail Pesanan #{order.order_number}{" "}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {" "}
          {canConfirm && (
            <button
              onClick={handleConfirmReceived}
              disabled={isConfirming}
              className="confirm-button inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isConfirming ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              )}
              {isConfirming ? "Memproses..." : "Konfirmasi Diterima"}
            </button>
          )}
          <button
            onClick={downloadInvoice}
            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm text-sm font-medium hide-on-print transition duration-150 ease-in-out"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-2" /> Unduh Nota
          </button>
        </div>
      </div>
      <div
        ref={invoiceRef}
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 border border-gray-200"
      >
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Informasi Pesanan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800">
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                No. Order:
              </span>{" "}
              {order.order_number}
            </div>
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                Status Pesanan:
              </span>{" "}
              <span className="capitalize font-medium">
                {order.status?.replace("_", " ")} {/* Format status */}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                Tanggal Pesan:
              </span>{" "}
              {order.order_date
                ? format(new Date(order.order_date), "dd MMM yyyy, HH:mm", {
                  locale: id,
                })
                : "-"}
            </div>
            <div>
              <span className="font-semibold text-gray-600 w-28 inline-block">
                Total Bayar:
              </span>{" "}
              <span className="font-bold text-gray-900">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            {order.payment && (
              <>
                <div>
                  <span className="font-semibold text-gray-600 w-28 inline-block">
                    Metode Bayar:
                  </span>{" "}
                  {order.payment.payment_type
                    ?.replace(/_/g, " ")
                    ?.toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-gray-600 w-28 inline-block">
                    Status Bayar:
                  </span>{" "}
                  <span className="capitalize font-medium">
                    {order.payment.status}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-200">
          {order.address && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Alamat Pengiriman
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium">{order.address.recipient_name}</p>
                <p>{order.address.phone_number}</p>
                <p>{order.address.address_line1}</p>
                {order.address.address_line2 && (
                  <p>{order.address.address_line2}</p>
                )}
                <p>
                  {order.address.city}, {order.address.province}{" "}
                  {order.address.postal_code}
                </p>
              </div>
            </div>
          )}
          {order.shipment && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Info Pengiriman
              </h3>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-600">Kurir:</span>{" "}
                  {order.shipment.courier?.toUpperCase()} (
                  {order.shipment.service})
                </p>
                <p>
                  <span className="font-medium text-gray-600">Status:</span>{" "}
                  <span
                    className={`capitalize font-medium px-1.5 py-0.5 rounded text-xs ${order.shipment.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.shipment.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {order.shipment.status}
                  </span>
                </p>
                <div className="flex items-center">
                  <span className="font-medium mr-1 text-gray-600">Resi:</span>
                  {order.shipment.tracking_number ? (
                    <span className="flex items-center gap-2">
                      <span>{order.shipment.tracking_number}</span>
                      <button
                        onClick={copyTrackingNumber}
                        className="p-1 text-blue-600 hover:text-blue-800 hide-on-print"
                        title="Salin nomor resi"
                      >
                        <FontAwesomeIcon icon={faCopy} size="xs" />
                      </button>
                    </span>
                  ) : (
                    <span className="text-gray-500">Belum Tersedia</span>
                  )}
                </div>
                <p>
                  <span className="font-medium text-gray-600">Ongkir:</span>{" "}
                  {formatCurrency(order.shipment.shipping_cost)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Produk yang Dipesan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-xs uppercase">
                  <th className="border-b font-semibold p-2">Produk</th>
                  <th className="border-b font-semibold p-2 text-right">
                    Harga Satuan
                  </th>
                  <th className="border-b font-semibold p-2 text-center">
                    Qty
                  </th>
                  <th className="border-b font-semibold p-2 text-right">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border-b p-2 text-gray-800">
                      {item.product?.name ? (
                        item.product.name
                      ) : (
                        <span className="text-gray-500">
                          Produk Tidak Tersedia
                        </span>
                      )}
                    </td>
                    <td className="border-b p-2 text-right whitespace-nowrap text-gray-800">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="border-b p-2 text-center text-gray-800">
                      {item.qty}
                    </td>
                    <td className="border-b p-2 text-right whitespace-nowrap text-gray-800">
                      {/* Calculate item subtotal */}
                      {formatCurrency(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Table Footer: Totals */}
              <tfoot>
                {/* Products Subtotal */}
                <tr>
                  <td
                    colSpan="3"
                    className="text-right font-semibold p-2 pt-3 text-gray-600"
                  >
                    Subtotal Produk:
                  </td>
                  <td className="text-right font-semibold p-2 pt-3 whitespace-nowrap text-gray-800">
                    {/* Calculate products subtotal (Total - Shipping Cost) */}
                    {formatCurrency(
                      order.total_amount - (order.shipping_cost || 0)
                    )}
                  </td>
                </tr>
                {/* Shipping Cost */}
                <tr>
                  <td
                    colSpan="3"
                    className="text-right font-semibold p-2 text-gray-600"
                  >
                    Biaya Pengiriman:
                  </td>
                  <td className="text-right font-semibold p-2 whitespace-nowrap text-gray-800">
                    {formatCurrency(order.shipping_cost || 0)}{" "}
                  </td>
                </tr>
                {/* Grand Total */}
                <tr className="bg-gray-100 font-bold text-base text-gray-800">
                  <td colSpan="3" className="text-right p-2">
                    Grand Total:
                  </td>
                  <td className="text-right p-2 whitespace-nowrap">
                    {formatCurrency(order.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>{" "}
    </div>
  );
};

export default OrderDetail;
