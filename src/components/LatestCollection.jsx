import { useState, useEffect } from "react";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
    const [latestProducts, setLatestProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/user/get_latest_products");
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    throw new Error(`Gagal memuat produk terbaru: ${response.status} ${errorData.message || ''}`);
                }
                const data = await response.json();

                if (data && Array.isArray(data.data)) {
                    const formattedProducts = data.data.map(product => ({
                        id: product.id,
                        name: product.name,
                        original_price: product.original_price,
                        image: product.primary_image || '/placeholder.jpg',
                        slug: product.slug,
                        stock: product.stock,
                    }));
                    setLatestProducts(formattedProducts);
                } else {
                    console.warn("Format data produk terbaru tidak sesuai:", data);
                    setLatestProducts([]);
                }
            } catch (err) {
                console.error("Error fetching latest products:", err);
                setError(err.message || "Terjadi kesalahan saat mengambil data produk terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl text-gray-500">Memuat Produk Terbaru...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <section className="my-10">
            <div className="text-center py-8">
                <Title text1="PRODUK" text2="TERBARU" />
            </div>

            {latestProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-10">Belum ada produk terbaru saat ini.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 px-4 sm:px-6 lg:px-8">
                    {latestProducts.map((item) => (
                        <div key={item.id} className="transform transition-transform duration-300 ease-in-out hover:scale-[1.03]">
                            <ProductItem
                                id={item.id}
                                image={item.image}
                                name={item.name}
                                original_price={item.original_price}
                                slug={item.slug}
                                stock={item.stock}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default LatestCollection;