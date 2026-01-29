import { useState, useEffect, useContext } from 'react';
import ProductItem from '../components/ProductItem';
import { AppContext } from '../context/AppContext';

const ProductRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [errorRecs, setErrorRecs] = useState(null);
    const { token, authFetch } = useContext(AppContext);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoadingRecs(true);
            setErrorRecs(null);
            setRecommendations([]);

            if (!token) {
                console.log("ProductRecommendations: No token found, skipping fetch.");
                setLoadingRecs(false);
                return;
            }

            try {
                console.log("ProductRecommendations: Token found, fetching recommendations...");
                const response = await authFetch('/api/user/recommendations/cart?limit=6');
                const data = await response.json();

                if (response.ok) {
                    if (data && Array.isArray(data.data)) {
                        const formattedRecs = data.data.map(item => ({
                            id: item.id,
                            name: item.name,
                            original_price: item.original_price ?? 0,
                            image: item.primary_image || '/placeholder.jpg',
                            slug: item.slug,
                            stock: item.stock ?? 1,
                        }));
                        setRecommendations(formattedRecs);
                    } else if (Array.isArray(data)) {
                        const formattedRecs = data.map(item => ({
                            id: item.id, name: item.name, original_price: item.original_price ?? 0,
                            image: item.primary_image || '/placeholder.jpg',
                            slug: item.slug, stock: item.stock ?? 1,
                        }));
                        setRecommendations(formattedRecs);
                    }
                    else {
                        console.warn("Recommendation data format unexpected:", data);
                        setRecommendations([]);
                    }
                } else {
                    console.error("Failed to fetch recommendations:", data);
                    setRecommendations([]);
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
                if (error.message !== "Unauthorized" && error.message !== "Forbidden" && error.message !== "User not authenticated") {
                    setErrorRecs("Gagal memuat rekomendasi."); // Tampilkan error umum saja
                }
                setRecommendations([]);
            } finally {
                setLoadingRecs(false);
            }
        };

        fetchRecommendations();
    }, [token, authFetch]);

    if (!token || loadingRecs || errorRecs || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 lg:mt-20">
            <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Anda Mungkin Juga Suka</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recommendations.map(product => (
                    <ProductItem
                        key={product.id}
                        {...product}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;