import { useContext, useEffect, useState, useCallback } from "react";
import Title from "../components/Title";
import { useSearchParams } from "react-router-dom";
import ProductItem from "../components/ProductItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";

const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        if (value.length > 0) query.append(key, value[0]);
      } else {
        query.append(key, value);
      }
    }
  });
  return query.toString();
};

const formatProductItem = (item) => {
  if (
    !item ||
    typeof item !== "object" ||
    item.id === undefined ||
    item.name === undefined
  ) {
    console.warn("Invalid product item structure:", item);
    return null;
  }
  const originalPriceValue = item.original_price ?? 0;
  return {
    id: item.id,
    name: item.name,
    original_price: originalPriceValue,
    image: item.primary_image ? item.primary_image : "/placeholder.jpg",
    category: item.category?.name || "Unknown",
    description: item.description,
    slug: item.slug,
    stock: item.stock ?? 1,
  };
};

const Collection = () => {
  const { search, showSearch, setShowSearch } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [sortOption, setSortOption] = useState("relevance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const initialCategoryIdFilter = searchParams.get("category") || null;

  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      setAllCategories([]);
      console.log("Fetching categories...");
      try {
        const response = await fetch("/api/user/get_categories");
        console.log("Category API Response Status:", response.status);
        if (!response.ok) {
          let errorBody = `HTTP error! status: ${response.status}`;
          try {
            const text = await response.text();
            const json = JSON.parse(text);
            errorBody = json.message || JSON.stringify(json);
          } catch (parseError) { }
          throw new Error(`Gagal mengambil kategori: ${errorBody}`);
        }
        const responseData = await response.json();
        console.log("Raw Category API Data:", responseData);
        const categoryArraySource = responseData?.data || responseData;
        if (Array.isArray(categoryArraySource)) {
          const formattedCategories = categoryArraySource
            .map((cat) => {
              if (
                !cat ||
                typeof cat !== "object" ||
                cat.id === undefined ||
                cat.name === undefined
              )
                return null;
              return { id: cat.id, name: cat.name };
            })
            .filter(Boolean);
          setAllCategories(formattedCategories);
        } else {
          throw new Error("Format data kategori tidak valid.");
        }
      } catch (catError) {
        console.error("Error fetching categories:", catError);
        setCategoryError(catError.message || "Gagal memuat kategori.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (initialCategoryIdFilter) {
      const initialId = parseInt(initialCategoryIdFilter, 10);
      if (!isNaN(initialId) && !selectedCategoryIds.includes(initialId)) {
        console.log(
          "Setting initial category filter from URL param:",
          initialId
        );
        setSelectedCategoryIds([initialId]);
      }
    } else if (
      !initialCategoryIdFilter &&
      selectedCategoryIds.length > 0 &&
      !location.state?.navigatedInternally
    ) {
      // memerlukan useLocation()
    }
  }, [initialCategoryIdFilter]);

  const fetchSearchResults = useCallback(
    async (page, keyword, categoryIds, sort) => {
      setLoading(true);
      setError(null);
      console.log(`Workspaceing search results... Params:`, {
        page,
        keyword,
        categoryIds,
        sort,
      });
      let sortBy = "_score",
        sortOrder = "desc";
      if (sort === "price-asc") {
        sortBy = "original_price";
        sortOrder = "asc";
      } else if (sort === "price-desc") {
        sortBy = "original_price";
        sortOrder = "desc";
      }
      const params = {
        page: page,
        keyword: keyword,
        category_id: categoryIds.length > 0 ? categoryIds[0] : null,
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: 12,
      };
      const queryString = buildQueryString(params);
      const apiUrl = `/api/products/search?${queryString}`;
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          let errorBody = `HTTP error! status: ${response.status}`;
          try {
            const text = await response.text();
            const json = JSON.parse(text);
            errorBody = json.message || JSON.stringify(json);
          } catch (parseError) { }
          throw new Error(`Gagal mengambil produk: ${errorBody}`);
        }
        const responseData = await response.json();
        if (responseData && responseData.links && responseData.meta) {
          let productArraySource = null;
          if (Array.isArray(responseData.data)) {
            productArraySource = responseData.data;
          } else if (
            typeof responseData.data === "object" &&
            responseData.data !== null
          ) {
            productArraySource = Object.values(responseData.data);
          } else {
            productArraySource = [];
          }
          const formattedProducts = productArraySource
            .map(formatProductItem)
            .filter(Boolean);
          setProducts(formattedProducts);
          setPaginationData({
            links: responseData.links,
            meta: responseData.meta,
          });
        } else {
          throw new Error("Format respons server tidak dikenali.");
        }
      } catch (fetchError) {
        console.error("Error fetching search results:", fetchError);
        setError(fetchError.message || "Terjadi kesalahan.");
        setProducts([]);
        setPaginationData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    console.log("Search effect triggered. Deps:", {
      currentPage,
      search,
      selectedCategoryIds,
      sortOption,
    });
    fetchSearchResults(currentPage, search, selectedCategoryIds, sortOption);
  }, [
    currentPage,
    search,
    selectedCategoryIds,
    sortOption,
    fetchSearchResults,
  ]);

  const toggleCategoryFilter = useCallback(
    (categoryId) => {
      const currentId = parseInt(categoryId, 10);
      if (isNaN(currentId)) return;

      const newSelectedIds = selectedCategoryIds.includes(currentId)
        ? selectedCategoryIds.filter((id) => id !== currentId)
        : [currentId];

      setSelectedCategoryIds(newSelectedIds);
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", "1");
          if (newSelectedIds.length > 0) {
            newParams.set("category", newSelectedIds[0].toString());
          } else {
            newParams.delete("category");
          }
          return newParams;
        },
        { replace: true }
      );
    },
    [selectedCategoryIds, setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (
        newPage >= 1 &&
        paginationData?.meta?.last_page &&
        newPage <= paginationData.meta.last_page
      ) {
        setSearchParams(
          (prev) => {
            const n = new URLSearchParams(prev);
            n.set("page", newPage.toString());
            return n;
          },
          { replace: true }
        );
        window.scrollTo(0, 0);
      }
    },
    [paginationData, setSearchParams]
  );

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.set("page", "1");
        return n;
      },
      { replace: true }
    );
  };

  const renderCategoryFilters = () => {
    if (loadingCategories) {
      return (
        <div className="flex items-center justify-center py-3 text-sm text-gray-500">
          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Memuat
          kategori...
        </div>
      );
    }
    if (categoryError) {
      return (
        <p className="py-3 text-sm text-red-500 text-center">
          Error: {categoryError}
        </p>
      );
    }
    if (allCategories.length === 0) {
      return (
        <p className="py-3 text-sm text-gray-500 text-center">
          Tidak ada kategori.
        </p>
      );
    }
    return (
      <div className="flex overflow-x-auto space-x-2 py-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {allCategories.map((cat) => (
          <label
            key={cat.id}
            className={`px-4 py-1.5 border rounded-full cursor-pointer text-sm whitespace-nowrap transition-colors duration-150 ease-in-out
              ${selectedCategoryIds.includes(cat.id)
                ? "bg-neutral-800 text-white border-neutral-800"
                : "bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200 hover:border-neutral-400"
              }`}
          >
            <input
              type="checkbox"
              value={cat.id}
              checked={selectedCategoryIds.includes(cat.id)}
              onChange={() => toggleCategoryFilter(cat.id)}
              className="sr-only"
            />
            {cat.name || `Kategori ID ${cat.id}`}
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="border-t px-4 sm:px-8 pt-8 mt-9">
      <main>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <Title text1="SEMUA" text2="KOLEKSI" />
          <div className="flex items-center gap-4">
            {" "}
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="border border-gray-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              disabled={loading}
            >
              <option value="relevance">Urutkan: Paling Sesuai</option>
              <option value="price-asc">Urutkan: Harga Terendah</option>
              <option value="price-desc">Urutkan: Harga Tertinggi</option>
            </select>
            <FontAwesomeIcon
              onClick={() => setShowSearch((prev) => !prev)}
              icon={faSearch}
              className="cursor-pointer text-gray-600 hover:text-black h-5"
              title={
                showSearch ? "Sembunyikan Pencarian" : "Tampilkan Pencarian"
              }
            />
          </div>
        </div>

        <div className="mb-6 border-b border-gray-200 pb-3">
          {renderCategoryFilters()}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="2x"
              className="text-gray-500"
            />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10 px-4">
            <p className="font-semibold">Oops!</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-10 px-4">
            Tidak ada produk yang cocok.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map(
              (item) =>
                item && (
                  <div
                    key={item.id}
                    className="transform transition-transform duration-300 ease-in-out hover:scale-[1.03]"
                  >
                    <ProductItem {...item} />
                  </div>
                )
            )}
          </div>
        )}

        {paginationData?.meta?.last_page > 1 &&
          !loading &&
          products.length > 0 && (
            <div className="flex justify-center items-center space-x-2 mt-8 py-4 border-t">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || !paginationData?.links?.prev}
                className={`px-4 py-2 border rounded text-sm ${currentPage === 1 || !paginationData?.links?.prev
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Sebelumnya
              </button>
              {paginationData?.meta && (
                <span className="text-sm text-gray-600">
                  {" "}
                  Hal {paginationData.meta.current_page} dari{" "}
                  {paginationData.meta.last_page}{" "}
                </span>
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === paginationData?.meta?.last_page ||
                  !paginationData?.links?.next
                }
                className={`px-4 py-2 border rounded text-sm ${currentPage === paginationData?.meta?.last_page ||
                    !paginationData?.links?.next
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Berikutnya
              </button>
            </div>
          )}
      </main>
    </div>
  );
};

export default Collection;
