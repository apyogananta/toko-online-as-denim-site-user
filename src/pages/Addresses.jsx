import { useEffect, useState, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPlus,
  faEdit,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const Addresses = () => {
  const { authFetch } = useContext(AppContext);

  const getInitialFormData = useCallback(
    () => ({
      recipient_name: "",
      phone_number: "",
      address_line1: "",
      address_line2: "",
      province: "",
      city: "",
      postal_code: "",
      is_default: false,
    }),
    []
  );

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.title = "historich-fleur - Alamat";
  }, []);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authFetch("/api/user/addresses");
      const data = await response.json();

      if (response.ok && data && Array.isArray(data.data)) {
        setAddresses(data.data);
      } else {
        throw new Error(data?.message || "Gagal mengambil data alamat.");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      if (
        error.message !== "Unauthorized" &&
        error.message !== "Forbidden" &&
        error.message !== "User not authenticated"
      ) {
        toast.error(
          error.message || "Terjadi kesalahan saat mengambil data alamat."
        );
      }
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name] || errors.global) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
        global: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const url = editingAddressId
        ? `/api/user/addresses/${editingAddressId}`
        : "/api/user/addresses";
      const method = editingAddressId ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        toast.success(
          data.message ||
            `Alamat berhasil ${editingAddressId ? "diperbarui" : "disimpan"}.`
        );
        await fetchAddresses();
        resetForm();
      } else if (response.status === 422) {
        setErrors(data.errors || {});
        toast.error("Input tidak valid.");
      } else {
        setErrors({
          global:
            data?.message ||
            `Gagal ${editingAddressId ? "memperbarui" : "menyimpan"} alamat.`,
        });
        toast.error(
          data?.message ||
            `Gagal ${editingAddressId ? "memperbarui" : "menyimpan"} alamat.`
        );
      }
    } catch (error) {
      console.error("Error saving address:", error);
      if (
        error.message !== "Unauthorized" &&
        error.message !== "Forbidden" &&
        error.message !== "User not authenticated"
      ) {
        toast.error(
          error.message ||
            `Terjadi kesalahan saat ${
              editingAddressId ? "memperbarui" : "menyimpan"
            } alamat.`
        );
        setErrors({ global: `Terjadi kesalahan jaringan atau server.` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      setDeletingId(id);
      try {
        const response = await authFetch(`/api/user/addresses/${id}`, {
          method: "DELETE",
        });

        if (response.ok || response.status === 204) {
          toast.success("Alamat berhasil dihapus.");
          await fetchAddresses();
        } else {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data?.message ||
              `Gagal menghapus alamat (Status: ${response.status})`
          );
        }
      } catch (error) {
        console.error("Error deleting address:", error);
        if (
          error.message !== "Unauthorized" &&
          error.message !== "Forbidden" &&
          error.message !== "User not authenticated"
        ) {
          toast.error(
            error.message || "Terjadi kesalahan saat menghapus alamat."
          );
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (address) => {
    setFormData({
      recipient_name: address.recipient_name || "",
      phone_number: address.phone_number || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      province: address.province || "",
      city: address.city || "",
      postal_code: address.postal_code || "",
      is_default: address.is_default || false,
    });
    setEditingAddressId(address.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrors({});
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingAddressId(null);
    setShowForm(false);
    setErrors({});
  };

  const renderFormFields = () => {
    const fields = [
      {
        label: "Nama Penerima",
        name: "recipient_name",
        type: "text",
        required: true,
      },
      {
        label: "Nomor Telepon",
        name: "phone_number",
        type: "tel",
        required: true,
      },
      {
        label: "Alamat Baris 1",
        name: "address_line1",
        type: "text",
        required: true,
      },
      {
        label: "Alamat Baris 2 (Opsional)",
        name: "address_line2",
        type: "text",
        required: false,
      },
      { label: "Provinsi", name: "province", type: "text", required: true },
      { label: "Kota/Kabupaten", name: "city", type: "text", required: true },
      {
        label: "Kode Pos",
        name: "postal_code",
        type: "text",
        inputMode: "numeric",
        required: true,
      },
    ];

    return (
      <>
        {fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={`address-${field.name}`}
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={`address-${field.name}`} // ID unik
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.label}
              className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${
                errors[field.name]
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:border-black focus:ring-black"
              }`}
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `${field.name}-error-addr` : undefined
              }
              required={field.required}
              disabled={isSubmitting}
              {...(field.inputMode && { inputMode: field.inputMode })}
            />
            {errors[field.name] && (
              <p
                id={`${field.name}-error-addr`}
                className="text-red-500 text-xs mt-1"
              >
                {errors[field.name][0]}
              </p>
            )}
          </div>
        ))}
        <div className="mt-2">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="form-checkbox rounded accent-black h-4 w-4 text-black focus:ring-black border-gray-300"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-700">
              Jadikan alamat default
            </span>
          </label>
          {errors.is_default && (
            <p className="text-red-500 text-xs mt-1">{errors.is_default[0]}</p>
          )}
        </div>
      </>
    );
  };

  // === Render Komponen Utama ===
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2">Alamat Saya</h2>

      {!showForm ? (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAddressId(null);
            setFormData(getInitialFormData());
            setErrors({});
          }}
          className="inline-flex items-center mb-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Tambah Alamat Baru
        </button>
      ) : (
        // Area Form
        <div className="border p-4 sm:p-6 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            {editingAddressId ? "Edit Alamat" : "Tambah Alamat Baru"}
          </h3>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid gap-4 max-w-md"
          >
            {/* Pesan Error Global */}
            {errors.global && (
              <div
                role="alert"
                className="w-full text-red-600 bg-red-100 border border-red-400 text-sm text-center p-3 rounded-md"
              >
                <p>{errors.global}</p>
              </div>
            )}
            {renderFormFields()}
            {/* Tombol Form */}
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex justify-center items-center bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                ) : editingAddressId ? (
                  "Perbarui Alamat"
                ) : (
                  "Simpan Alamat"
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Alamat */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="lg"
            className="text-gray-500"
          />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <p className="text-gray-500 text-center py-5">
          Anda belum menambahkan alamat pengiriman.
        </p>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border p-4 rounded-lg transition-opacity duration-300 ${
                deletingId === address.id ? "opacity-50" : ""
              }`}
            >
              {" "}
              {/* Style saat deleting */}
              <div className="flex justify-between items-start">
                <div>
                  {address.is_default && (
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2 inline-block">
                      Alamat Utama
                    </span>
                  )}
                  <p className="font-semibold text-gray-800">
                    {address.recipient_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.phone_number}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.address_line1}
                  </p>
                  {address.address_line2 && (
                    <p className="text-sm text-gray-600">
                      {address.address_line2}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.province} {address.postal_code}
                  </p>
                </div>
                {/* Tombol Aksi */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    onClick={() => handleEdit(address)}
                    disabled={deletingId === address.id || isSubmitting}
                    title="Edit Alamat"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id || isSubmitting}
                    title="Hapus Alamat"
                  >
                    {deletingId === address.id ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faTrashAlt} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
