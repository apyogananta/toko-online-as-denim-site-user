import { useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";

const About = () => {
  useEffect(() => {
    document.title = "Historich Fleur - About US";
  }, []);

  return (
    <div className="pt-36 px-4 lg:px-20 text-gray-700">
      <div className="text-center mb-12">
        <Title text1={"ABOUT"} text2={"US"} />
        <p className="mt-4 text-base md:text-lg text-gray-500 max-w-3xl mx-auto">
          Kenali lebih dekat siapa kami, visi, dan misi yang membentuk historich-fleur.
        </p>
      </div>

      <div className="flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
        {/* Text */}
        <div className="md:w-1/2 space-y-6">
          <p>
            <strong className="text-gray-900">historich-fleur</strong> Toko Bunga Historich Fleur merupakan usaha yang bergerak di bidang penjualan dan jasa rangkai bunga (florist) yang melayani berbagai kebutuhan pelanggan, seperti buket bunga, bunga meja dan juga bunga tangan. Berdiri
            sejak 16 Agustus 2022, historich-fleur berlokasi di Jl. Gusti Hamzah, Desa Sungai Bangkong, Kec. Pontianak Kota, Kota Pontianak(Tepat Didepan atau diseberang Weng Coffe Pancasila)Kalimantan Barat.
          </p>
          <p>
            Historich Fleur didirikan dengan tujuan untuk menyediakan produk bunga yang berkualitas, bernilai estetika tinggi, serta memiliki makna emosional bagi setiap pelanggan.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              VISI KAMI
            </h3>
            <p>
              Menjadi toko bunga inovatif yang hadir di waktu dan momen yang tepat, desain rangkaian bunga yang kreatif dan modern, serta mampu menjadi media bagi pelanggan untuk menyampaikan perasaan dan pesan hati melalui keindahan bunga.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              MISI KAMI
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Menyediakan layanan toko bunga yang buka pada malam hari untuk memenuhi kebutuhan pelanggan di luar jam operasi florist pada umumnya.
              </li>
              <li>
                Menghadirkan desain rangkaian bunga yang up to date, kreatif, dan mengikuti tren modern sesuai selera pelanggan.
              </li>
              <li>
                Memberikan layanan personalisasi pesan pada setiap rangkaian bunga agar pelanggan dapat menyampaikan isi hati, emosi, dan makna secara lebih mendalam              </li>
              <li>
                Menjaga kualitas, kesegaran, dan estetika bunga sebagai bentuk komitmen terhadap kepuasan pelanggan
              </li>
              <li>
                Memberikan pilihan bunga yang mencerminkan kepribadian pelanggan, serta Memanfaatkan teknologi digital dan media online untuk mempermudah proses pemesanan dan komunikasi dengan pelanggan
              </li>
            </ul>
          </div>
        </div>

        {/* Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={assets.historichfleur}
            alt="Tentang historich-fleur"
            className="rounded-lg shadow-md max-h-[400px] object-cover w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
