import { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const Orders = () => {
  const { authFetch } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    document.title = "Historich Fleur - Pesanan Saya";
  }, []);

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authFetch(`/api/user/user_orders?page=${page}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || `Gagal mengambil pesanan (${response.status})`
          );
        }
        const data = await response.json();

        if (data && Array.isArray(data.data)) {
          setOrders(data.data);
          setPaginationData({ links: data.links, meta: data.meta });
        } else {
          throw new Error("Format data pesanan tidak valid.");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.message !== "Unauthorized" && error.message !== "Forbidden") {
          setError(
            error.message || "Terjadi kesalahan saat mengambil pesanan."
          );
        }
        setOrders([]);
        setPaginationData(null);
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      paginationData &&
      newPage <= paginationData.meta.last_page
    ) {
      setSearchParams({ page: newPage.toString() }, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm text-center min-h-[300px] flex justify-center items-center">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="lg"
          className="text-gray-400"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-red-50 border border-red-200 rounded-lg shadow-sm text-center text-red-700">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" /> {error}
        <button
          onClick={() => fetchOrders(currentPage)}
          className="ml-3 text-xs underline font-medium"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
        Pesanan Saya
      </h2>
      {orders.length === 0 ? (
        <p className="text-gray-600 text-center py-5">
          Anda belum memiliki pesanan.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <th className="border-b p-3 font-semibold">No. Order</th>
                  <th className="border-b p-3 font-semibold">Tanggal</th>
                  <th className="border-b p-3 font-semibold">Status</th>
                  <th className="border-b p-3 font-semibold">Total</th>
                  <th className="border-b p-3 font-semibold text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 align-top">
                    <td className="border-b p-3 font-medium text-gray-700">
                      {order.order_number}
                    </td>
                    <td className="border-b p-3 whitespace-nowrap">
                      {order.order_date
                        ? format(
                          new Date(order.order_date),
                          "dd MMM yyyy HH:mm",
                          { locale: id }
                        )
                        : "-"}
                    </td>
                    <td className="border-b p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${order.status === "processed"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "awaiting_payment"
                                ? "bg-orange-100 text-orange-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="border-b p-3 whitespace-nowrap">
                      Rp {Number(order.total_amount).toLocaleString("id-ID")}
                    </td>
                    <td className="border-b p-3 text-center">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/orders/${order.id}`)
                        }
                        className="text-blue-600 hover:underline font-medium text-xs sm:text-sm"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginationData && paginationData.meta.last_page > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded text-sm ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                &lt; Sebelumnya
              </button>
              <span className="text-sm text-gray-600">
                Halaman {paginationData.meta.current_page} dari{" "}
                {paginationData.meta.last_page}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationData.meta.last_page}
                className={`px-3 py-1 border rounded text-sm ${currentPage === paginationData.meta.last_page
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Berikutnya &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
