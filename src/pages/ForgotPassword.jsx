import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const ForgotPassword = () => {
  useEffect(() => {
    document.title = "Historich Fleur - Lupa Password";
  }, []);

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setIsLoading(true);

    if (!email) {
      setErrors({ email: ["Alamat email wajib diisi."] });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/password/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message ||
          "Link reset password telah dikirim (jika email terdaftar)."
        );
        setMessage(
          data.message ||
          "Link reset password telah dikirim. Silakan cek email Anda."
        );
        setEmail("");
        setErrors({});
      } else if (response.status === 422) {
        setErrors(data.errors || {});
        toast.error("Format email tidak valid.");
      } else {
        setErrors({
          global:
            data?.message ||
            "Gagal mengirim link reset. Email mungkin tidak terdaftar.",
        });
        toast.error(data?.message || "Gagal mengirim link reset.");
      }
    } catch (err) {
      console.error("Forgot Password error:", err);
      setErrors({
        global: "Terjadi kesalahan jaringan atau server. Silakan coba lagi.",
      });
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-10">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-10 sm:mt-14 gap-5 bg-white p-6 sm:p-8 rounded-lg shadow-lg" // Styling mirip AuthForm
      >
        {/* Judul */}
        <div className="flex items-center gap-2 mb-4 text-center">
          <h1 className="prata-reguler text-2xl sm:text-3xl">LUPA PASSWORD</h1>
          <hr className="border-none h-[2px] w-8 bg-gray-800" />
        </div>

        <p className="text-center text-sm text-gray-600 mb-4">
          Masukkan email Anda yang terdaftar untuk menerima link reset password.
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

        {/* Pesan Sukses */}
        {message && !errors.global && (
          <div
            role="status"
            className="w-full text-green-700 bg-green-100 border border-green-400 text-sm text-center p-3 rounded-md mb-1"
          >
            <p>{message}</p>
          </div>
        )}

        {/* Input Email */}
        <div className="w-full">
          <label htmlFor="forgot-email" className="sr-only">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            name="email"
            placeholder="Masukkan Email Anda"
            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${errors.email
                ? "border-red-500 ring-red-500"
                : "border-gray-300 focus:border-black focus:ring-black"
              }`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email || errors.global) {
                setErrors((prev) => ({ ...prev, email: null, global: null }));
              }
              setMessage("");
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error-forgot" : undefined}
            required
            disabled={isLoading}
          />
          {errors.email && (
            <p id="email-error-forgot" className="text-red-500 text-xs mt-1">
              {errors.email[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !!message}
          className={`w-full flex justify-center items-center bg-black text-white font-medium px-8 py-2 mt-4 rounded-md transition-all duration-300 ${isLoading || message
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-gray-900"
            }`}
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          ) : (
            "Kirim Link Reset"
          )}
        </button>

        <p className="mt-4 text-sm">
          Kembali ke{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Halaman Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
