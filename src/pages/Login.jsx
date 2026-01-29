import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";


const AuthForm = () => {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const getInitialFormData = () => ({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // State
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `Historich Fleur - ${isLogin ? "Masuk" : "Daftar"}`;
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, global: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const endpoint = isLogin ? "/api/user/login" : "/api/user/register";

    const payload = {
      email: formData.email,
      password: formData.password,
    };
    if (!isLogin) {
      payload.name = formData.name;
      payload.password_confirmation = formData.password_confirmation;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        if (isLogin) {
          setToken(data.token);
          toast.success(data.message || "Login berhasil!");
          navigate("/");
        } else {
          toast.success(data.message || "Registrasi berhasil! Silakan login.");
          resetForm();
          setIsLogin(true);
        }
      } else if (response.status === 422) {
        console.log("Validation errors:", data.errors);
        setErrors(data.errors || {});
        toast.error("Input tidak valid, silakan periksa kembali.");
      } else {
        console.error("API Error:", data);
        setErrors({
          global: data?.message || "Terjadi kesalahan pada server.",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setErrors({
        global: "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form dan error
  const resetForm = () => {
    setFormData(getInitialFormData());
    setErrors({});
  };

  const toggleForm = () => {
    resetForm();
    setIsLogin(!isLogin);
  };

  const renderFormFields = () => {
    const fields = [];
    if (!isLogin) {
      fields.push({ label: "Nama Lengkap", name: "name", type: "text" });
    }
    fields.push(
      { label: "Email", name: "email", type: "email" },
      { label: "Password", name: "password", type: "password" }
    );
    if (!isLogin) {
      fields.push({
        label: "Konfirmasi Password",
        name: "password_confirmation",
        type: "password",
      });
    }

    return (
      <>
        {fields.map((field) => (
          <div key={field.name} className="w-full">
            <label htmlFor={field.name} className="sr-only">
              {field.label}
            </label>{" "}
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.label}
              className={`w-full px-4 py-2 border ${errors[field.name]
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
              aria-invalid={!!errors[field.name]}
              aria-describedby={
                errors[field.name] ? `${field.name}-error` : undefined
              }
              required
              disabled={isLoading}
            />
            {errors[field.name] && (
              <p
                id={`${field.name}-error`}
                className="text-red-500 text-xs mt-1"
                role="alert"
              >
                {errors[field.name][0]}
              </p>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="pt-24 pb-10">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-10 sm:mt-14 gap-5 bg-white p-6 sm:p-8 rounded-lg shadow-lg" // Perbesar padding & shadow
      >
        {/* Judul Form */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="prata-reguler text-2xl sm:text-3xl">
            {isLogin ? "MASUK AKUN" : "BUAT AKUN"}
          </h1>
          <hr className="border-none h-[2px] w-8 bg-gray-800" />
        </div>

        {/* Pesan Error Global */}
        {errors.global && (
          <div
            role="alert"
            className="w-full text-red-600 bg-red-100 border border-red-400 text-sm text-center p-3 rounded-md mb-4"
          >
            <p>{errors.global}</p>
          </div>
        )}

        {renderFormFields()}

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center bg-black hover:bg-gray-900 text-white font-medium px-8 py-2 mt-4 rounded-md transition-all duration-300 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          ) : isLogin ? (
            "MASUK"
          ) : (
            "DAFTAR"
          )}
        </button>

        {/* Link Toggle Form */}
        <p className="mt-4 text-sm text-center">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline focus:outline-none font-medium"
            onClick={!isLoading ? toggleForm : undefined}
            disabled={isLoading}
          >
            {isLogin ? "Daftar di sini" : "Masuk di sini"}
          </button>
        </p>

        {/* Link Lupa Password */}
        {isLogin && (
          <p className="mt-2 text-sm text-center">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Lupa Password?
            </Link>
          </p>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
