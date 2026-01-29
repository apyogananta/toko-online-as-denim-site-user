import { useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const Contact = () => {
  useEffect(() => {
    document.title = "Historich Fleur - Kontak";
  }, []);

  return (
    <div className="pt-36 px-4 lg:px-20 text-gray-700">
      {/* Judul */}
      <div className="text-center mb-12">
        <Title text1="OUR" text2="CONTACT" />
        <p className="mt-4 text-base md:text-lg text-gray-500">
          Hubungi kami melalui alamat dan kontak berikut
        </p>
      </div>

      {/* Konten Utama */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-28">
        {/* Logo atau Gambar */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            className="w-full max-w-[400px] rounded-lg shadow-md object-contain"
            src={assets.historichfleur}
            alt="Historich Fleur Logo"
          />
        </div>

        {/* Info Kontak */}
        <div className="w-full md:w-1/2 space-y-6">
          <div>
            <h3 className="font-semibold text-xl text-gray-800 mb-2">
              🏬 Our Outlet
            </h3>
            <p className="text-gray-600">
              Jl. Gusti Hamzah , Sungai Bangkong, Kec. Pontianak Kota(Depan Weng Coffe Pancasila).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xl text-gray-800 mb-2">
              📞 Contact
            </h3>
            <p className="text-gray-600">
              +62 895 0565 7899 <br />
              historich_fleur@gmail.com
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-xl text-gray-800 mb-2">
              ⏰ Operational Time
            </h3>
            <p className="text-gray-600">
              Setiap Hari <br />
              20.00 - 00.00 WIB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
