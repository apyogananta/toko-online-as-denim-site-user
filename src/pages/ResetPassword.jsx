import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  // State
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    document.title = "Historich Fleur - Reset Password";
    const query = new URLSearchParams(search);
    const urlToken = query.get("token");
    const urlEmail = query.get("email");

    if (!urlToken || !urlEmail) {
      toast.error("Link reset password tidak valid atau tidak lengkap.");
      navigate("/login");
    } else {
      setToken(urlToken);
      setEmail(urlEmail);
    }
  }, [search, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.global) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
        global: null,
      }));
    }
    if (name === "password" && errors.password_confirmation) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password_confirmation: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (!token || !email) {
        toast.error("Informasi reset tidak lengkap.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message || "Password berhasil direset. Silakan login."
        );
        navigate("/login");
      } else if (response.status === 422) {
        // Tangani error vlidasi dari Laravel
        setErrors(data.errors || {});
        toast.error("Input tidak valid, silakan periksa kembali.");
      } else {
        toast.error(data?.message || "Gagal mereset password.");
        setErrors({
          global:
            data?.message ||
            "Gagal mereset password. Link mungkin sudah tidak valid.",
        });
      }
    } catch (error) {
      console.error("Reset Password error:", error);
      toast.error("Terjadi kesalahan jaringan atau server.");
      setErrors({
        global: "Terjadi kesalahan jaringan atau server. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="pt-24 pb-10 flex justify-center items-center h-64">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="lg"
          className="text-gray-500"
        />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-10">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-10 sm:mt-14 gap-5 bg-white p-6 sm:p-8 rounded-lg shadow-lg" // Styling mirip AuthForm
      >
        {/* Judul */}
        <div className="flex items-center gap-2 mb-4 text-center">
          <h1 className="prata-reguler text-2xl sm:text-3xl">RESET PASSWORD</h1>
          <hr className="border-none h-[2px] w-8 bg-gray-800" />
        </div>

        <p className="text-sm text-center text-gray-600 mb-4">
          Masukkan password baru Anda untuk akun:{" "}
          <span className="font-medium">{email}</span>
        </p>

        {/* Pesan Error Global */}
        {errors.global && (
          <div
            role="alert"
            className="w-full text-red-600 bg-red-100 border border-red-400 text-sm text-center p-3 rounded-md mb-1"
          >
            <p>{errors.global}</p>
          </div>
        )}

        {/* Input Password Baru */}
        <div className="w-full">
          <label
            htmlFor="reset-password"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Password Baru
          </label>
          <input
            id="reset-password"
            type="password"
            name="password"
            placeholder="Masukkan password baru"
            value={formData.password}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${errors.password
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:border-black focus:ring-black"
              }`}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "password-error-reset" : undefined
            }
            required
            disabled={isLoading}
          />
          {errors.password && (
            <p id="password-error-reset" className="text-red-500 text-xs mt-1">
              {errors.password[0]}
            </p>
          )}
        </div>

        <div className="w-full">
          <label
            htmlFor="reset-password_confirmation"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Konfirmasi Password Baru
          </label>
          <input
            id="reset-password_confirmation"
            type="password"
            name="password_confirmation"
            placeholder="Ulangi password baru"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${errors.password_confirmation
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:border-black focus:ring-black"
              }`}
            aria-invalid={!!errors.password_confirmation}
            aria-describedby={
              errors.password_confirmation
                ? "password_confirmation-error-reset"
                : undefined
            }
            required
            disabled={isLoading}
          />
          {errors.password_confirmation && (
            <p
              id="password_confirmation-error-reset"
              className="text-red-500 text-xs mt-1"
            >
              {errors.password_confirmation[0]}
            </p>
          )}
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center bg-black text-white font-medium px-8 py-2 mt-4 rounded-md transition-all duration-300 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
