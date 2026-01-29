import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import ProductReview from "../components/ProductReview";
import ProductRecommendations from "./ProductRecommendations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Product = () => {
  const { slug } = useParams();
  const { addToCart } = useContext(AppContext);
  const [productData, setProductData] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      const apiUrl = `/api/user/product/${slug}/detail`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `(${response.status}) ${response.statusText}`,
          }));
          if (response.status === 404) {
            throw new Error("Produk tidak ditemukan.");
          }
          throw new Error(errorData.message || `Gagal mengambil data produk.`);
        }
        const data = await response.json();

        if (
          data &&
          data.data &&
          data.data.id &&
          data.data.name &&
          Array.isArray(data.data.images)
        ) {
          const product = data.data;

          setProductData(product);

          const imageUrls = product.images
            .map((img) => img.url)
            .filter(Boolean);
          setImages(imageUrls);

          const initialSelected =
            product.primary_image || imageUrls[0] || "/placeholder.jpg";
          setSelectedImage(initialSelected);

          document.title = `Historich Fleur - ${product.name}`;
        } else {
          console.error(
            "Format data produk dari API tidak sesuai (struktur nested):",
            data
          );
          throw new Error(
            "Gagal memproses data produk (struktur tidak sesuai)."
          );
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setError(error.message);
        setProductData(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductData();
    } else {
      setError("Slug produk tidak valid.");
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="3x"
          className="text-gray-500"
        />
      </div>
    );
  }

  if (error || !productData) {
    return (
      <p className="text-center mt-20 text-red-600">
        {error || "Produk tidak ditemukan."}
      </p>
    );
  }



  const handleAddToCart = () => {
    if (productData) {
      addToCart(productData.id, 1, productData.stock);
    }
  };

  const isOutOfStock = productData.stock <= 0;

  return (
    <div className="pb-10 border-t-2 pt-8 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/2">
            <div className="flex flex-col gap-4 sticky top-24">
              {" "}
              <div className="w-full aspect-square border rounded-lg shadow-lg overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={selectedImage || "/placeholder.jpg"}
                  alt={productData.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 justify-start flex-wrap">
                  {" "}
                  {images.map((imageUrl, index) => (
                    <div key={index} className="w-16 h-16 sm:w-20 sm:h-20">
                      {" "}
                      <img
                        onClick={() => setSelectedImage(imageUrl)}
                        src={imageUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className={`cursor-pointer rounded-md border-2 w-full h-full object-cover transition-all duration-200 ${selectedImage === imageUrl
                          ? "border-black"
                          : "border-gray-300 hover:border-gray-500"
                          }`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }} // Sembunyikan jika error
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col justify-start">
            {productData.category && (
              <Link
                to={`/collection?category=${productData.category.slug}`}
                className="text-sm text-gray-500 hover:text-black mb-2"
              >
                {productData.category.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4">
              {productData.name}
            </h1>
            <div className="mb-6">
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                Rp {productData.original_price.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-sm text-gray-500 mb-4 space-y-1">
              {productData.color && (
                <div>
                  Warna:{" "}
                  <span className="text-gray-800">{productData.color}</span>
                </div>
              )}
            </div>

            <p
              className={`mb-6 text-sm ${isOutOfStock ? "text-red-600 font-semibold" : "text-gray-600"
                }`}
            >
              Stok: {isOutOfStock ? "Habis" : productData.stock}
            </p>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full sm:w-auto bg-black text-white px-8 py-3 rounded transition-colors duration-200 ${isOutOfStock
                ? "bg-gray-400 cursor-not-allowed"
                : "hover:bg-gray-800"
                }`}
            >
              {isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
            </button>
          </div>
        </div>

        {productData.description && (
          <div className="mt-16 lg:mt-20">
            <div className="mb-4 border-b">
              <h2 className="inline-block pb-2 border-b-2 border-black text-lg font-semibold">
                Deskripsi Produk
              </h2>
            </div>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: productData.description }}
            />
          </div>
        )}

        <div className="mt-16 lg:mt-20">
          <div className="mb-4 border-b">
            <h2 className="inline-block pb-2 border-b-2 border-black text-lg font-semibold">
              Ulasan Produk
            </h2>
          </div>
          <ProductReview productId={productData.id} />
        </div>
      </div>

      <ProductRecommendations></ProductRecommendations>
    </div>
  );
};

export default Product;
