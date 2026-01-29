import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const ProductItem = ({
    image = "/placeholder.jpg",
    name = "Unknown Product",
    original_price = 0,
    slug = null,
    stock = 1,
}) => {
    const isOutOfStock = stock <= 0; // Lebih aman pakai <= 0
    const productContent = (
        <>
            <div className="relative w-full aspect-square overflow-hidden rounded-xl"> { }
                <img
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={image}
                    alt={name}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg" }}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 rounded-xl">
                        <span className="text-white text-sm font-bold px-2 py-1 bg-gray-700 bg-opacity-80 rounded">Stok Habis</span>
                    </div>
                )}
            </div>

            <p className="mt-3 text-sm font-semibold text-center line-clamp-2 h-10">
                {name}
            </p>

            <div className="flex flex-col items-center mt-1">
                <p className="text-sm font-bold text-gray-800">
                    Rp{original_price.toLocaleString("id-ID")}
                </p>
            </div>
        </>
    );

    const WrapperComponent = slug ? Link : 'div';
    const wrapperProps = slug
        ? { className: "text-gray-700 w-full group", to: `/product/${slug}` }
        : { className: "text-gray-700 w-full group" };


    return (
        <div className="flex flex-col justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 h-full overflow-hidden border border-rose-100 hover:border-rose-200">
            <WrapperComponent {...wrapperProps}>
                {productContent}
            </WrapperComponent>
            {/* Anda bisa tambahkan tombol Add to Cart di sini jika perlu */}
            {/* <button disabled={isOutOfStock} className={`mt-3 w-full text-sm py-2 rounded ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}>
                {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button> */}
        </div>
    );
};

ProductItem.propTypes = {
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    original_price: PropTypes.number,
    stock: PropTypes.number.isRequired,
    slug: PropTypes.string,
};

export default ProductItem;