import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import Title from "./Title";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SampleNextArrow(props) {
    const { onClick, className, style } = props;
    return (
        <div
            className={`${className} absolute top-1/2 right-0 transform -translate-y-1/2 text-gray-800 text-3xl cursor-pointer z-10 hover:text-black`}
            style={{ ...style, display: "block", right: "-25px" }}
            onClick={onClick}
        >
            <FaArrowCircleRight />
        </div>
    );
}

SampleNextArrow.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object
};

function SamplePrevArrow(props) {
    const { onClick, className, style } = props;
    return (
        <div
            className={`${className} absolute top-1/2 left-0 transform -translate-y-1/2 text-gray-800 text-3xl cursor-pointer z-10 hover:text-black`}
            style={{ ...style, display: "block", left: "-25px" }}
            onClick={onClick}
        >
            <FaArrowCircleLeft />
        </div>
    );
}

SamplePrevArrow.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/user/get_categories");
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    throw new Error(`Gagal mengambil data: ${response.status} ${errorData.message || ''}`);
                }
                const data = await response.json();

                if (data && Array.isArray(data.data)) {
                    setCategories(data.data);
                } else {
                    console.warn("Format data kategori tidak sesuai:", data);
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError(error.message || "Terjadi kesalahan saat mengambil data kategori.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const slidesToShow = categories.length === 0 ? 1 : Math.min(3, categories.length);
    const autoplay = categories.length > 3;
    const sliderSettings = {
        dots: false,
        infinite: categories.length > slidesToShow,
        speed: 600,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        autoplay: autoplay,
        autoplaySpeed: 4000,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1024, // lg
                settings: {
                    slidesToShow: Math.min(3, categories.length),
                }
            },
            {
                breakpoint: 768, // md
                settings: {
                    slidesToShow: Math.min(2, categories.length),
                }
            },
            {
                breakpoint: 640, // sm
                settings: {
                    slidesToShow: 1,
                    arrows: categories.length > 1
                }
            }
        ]
    };

    return (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center pb-6">
                <Title text1="KATEGORI" text2="PRODUK" />
            </div>
            {loading ? (
                <div className="text-center text-gray-500 py-10">Memuat kategori...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-10">Error: {error}</div>
            ) : categories.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Belum ada kategori produk.</div>
            ) : (
                <div className="relative max-w-6xl mx-auto px-8">
                    <Slider {...sliderSettings}>
                        {categories.map((category) => (
                            <div key={category.id} className="px-2 md:px-3">
                                <div
                                    className="cursor-pointer group flex flex-col items-center p-4 bg-gradient-to-br from-white via-rose-50 to-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                                    onClick={() => navigate(`/collection?category=${category.id}`)}
                                >
                                    <div className="w-full aspect-square overflow-hidden rounded-lg">
                                        <img
                                            src={category.image_url || '/placeholder.jpg'}
                                            alt={category.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg' }}
                                        />
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 text-center mt-4 group-hover:text-rose-700 transition-colors duration-300">
                                        {category.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
        </section>
    );
};

export default Categories;