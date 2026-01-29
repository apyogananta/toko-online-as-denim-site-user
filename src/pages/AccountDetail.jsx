import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const AccountDetails = () => {
    const { authFetch } = useContext(AppContext);

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState({});
    const [initialLoading, setInitialLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.title = "historich-fleur - Detail Akun";
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            setInitialLoading(true);
            setErrors({}); //
            try {
                const response = await authFetch("/api/user/get_user");
                const data = await response.json();

                if (response.ok) {
                    const userFromApi = data?.data || data;

                    if (userFromApi && userFromApi.name && userFromApi.email) {
                        setUserData((prevState) => ({
                            ...prevState,
                            name: userFromApi.name,
                            email: userFromApi.email,
                            password: "",
                            password_confirmation: "",
                        }));
                    } else {
                         console.error("Format data user dari API tidak sesuai:", data);
                         throw new Error("Gagal memproses data pengguna.");
                    }
                } else {
                    const errorMessage = data?.message || "Gagal mengambil data pengguna.";
                    toast.error(errorMessage);
                    setErrors({ global: errorMessage });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (error.message !== "Unauthorized" && error.message !== "Forbidden" && error.message !== "User not authenticated") {
                     toast.error("Terjadi kesalahan saat mengambil data pengguna.");
                     setErrors({ global: "Tidak dapat memuat data akun." });
                 }
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUserData();
    }, [authFetch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        if (errors[name] || errors.global) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: null, global: null }));
        }
        if (name === 'password' && errors.password_confirmation) {
             setErrors((prevErrors) => ({ ...prevErrors, password_confirmation: null }));
         }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsSubmitting(true);

        try {
            const updateData = { name: userData.name, email: userData.email };
            if (userData.password && userData.password.trim() !== "") {
                updateData.password = userData.password;
                updateData.password_confirmation = userData.password_confirmation;
            }

            const response = await authFetch("/api/user/update", {
                method: "PUT",
                body: JSON.stringify(updateData),
            });
            const data = await response.json();

            if (response.ok && data.user) {
                toast.success(data.message || "Profil berhasil diperbarui.");
                setUserData({
                     name: data.user.name,
                     email: data.user.email,
                     password: "",
                     password_confirmation: "",
                });
                setErrors({});
            } else if (response.status === 422) {
                setErrors(data.errors || {});
                toast.error("Input tidak valid, silakan periksa kembali.");
            } else {
                toast.error(data?.message || "Gagal memperbarui profil.");
                setErrors({ global: data?.message || "Gagal memperbarui profil." });
            }
        } catch (error) {
            console.error("Error updating user data:", error);
            if (error.message !== "Unauthorized" && error.message !== "Forbidden" && error.message !== "User not authenticated") {
                toast.error("Terjadi kesalahan saat memperbarui profil.");
                setErrors({ global: "Terjadi kesalahan pada server atau jaringan." });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <FontAwesomeIcon icon={faSpinner} spin size="lg" className="text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6 border-b pb-2">Detail Akun</h2>
            <form onSubmit={handleSubmit} noValidate className="grid gap-4 max-w-md">

                {/* Pesan Error Global */}
                {errors.global && (
                    <div role="alert" className="w-full text-red-600 bg-red-100 border border-red-400 text-sm text-center p-3 rounded-md">
                        <p>{errors.global}</p>
                    </div>
                )}

                {/* Field Nama Lengkap */}
                <div>
                    <label htmlFor="acc-name" className="block mb-1 text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                        type="text"
                        id="acc-name" // ID unik untuk label
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${errors.name ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error-acc" : undefined}
                        required
                        disabled={isSubmitting}
                    />
                    {errors.name && (
                        <p id="name-error-acc" className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                    )}
                </div>

                {/* Field Email */}
                <div>
                    <label htmlFor="acc-email" className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="acc-email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${errors.email ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error-acc" : undefined}
                        required
                        disabled={isSubmitting}
                    />
                     {errors.email && (
                        <p id="email-error-acc" className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
                    )}
                </div>

                {/* Field Password Baru */}
                <div className="mt-2">
                    <label htmlFor="acc-password" className="block mb-1 text-sm font-medium text-gray-700">Password Baru (opsional)</label>
                    <input
                        type="password"
                        id="acc-password"
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        placeholder="Isi jika ingin ganti password"
                        className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${errors.password ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error-acc" : undefined}
                        disabled={isSubmitting}
                    />
                    {errors.password && (
                        <p id="password-error-acc" className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
                    )}
                </div>

                {/* Field Konfirmasi Password Baru */}
                {(userData.password || errors.password_confirmation) && (
                     <div>
                        <label htmlFor="acc-password_confirmation" className="block mb-1 text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            id="acc-password_confirmation"
                            name="password_confirmation"
                            value={userData.password_confirmation}
                            onChange={handleChange}
                            placeholder="Ulangi password baru"
                            className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-1 ${errors.password_confirmation ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`}
                            aria-invalid={!!errors.password_confirmation}
                            aria-describedby={errors.password_confirmation ? "password_confirmation-error-acc" : undefined}
                            required={!!userData.password}
                            disabled={isSubmitting}
                        />
                        {errors.password_confirmation && (
                            <p id="password_confirmation-error-acc" className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>
                        )}
                    </div>
                 )}


                {/* Tombol Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full mt-4 sm:w-auto justify-center flex items-center bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? (
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2"/>
                    ) : (
                        'Simpan Perubahan'
                    )}
                </button>
            </form>
        </div>
    );
};

export default AccountDetails;