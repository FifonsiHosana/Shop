import { useEffect, useState } from "react";
import Hero from "../componenets/Layout/Hero";
import FeaturedCollections from "../componenets/Product/FeaturedCollections";
import FeaturesSection from "../componenets/Product/FeaturesSection";
import GenderCollectionSection from "../componenets/Product/GenderCollectionSection";
import NewArrivals from "../componenets/Product/NewArrivals";
import ProductDetails from "../componenets/Product/ProductDetails";
import ProductGrid from "../componenets/Product/ProductGrid";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productSlice";
import axios from "axios";

// const placeHolderProducts = [
//   {
//     _id: 1,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=51",
//       },
//     ],
//   },
//   {
//     _id: 2,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=21",
//       },
//     ],
//   },
//   {
//     _id: 3,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=43",
//       },
//     ],
//   },
//   {
//     _id: 4,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=38",
//       },
//     ],
//   },
//   {
//     _id: 5,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=9",
//       },
//     ],
//   },
//   {
//     _id: 6,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=13",
//       },
//     ],
//   },
//   {
//     _id: 7,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=35",
//       },
//     ],
//   },
//   {
//     _id: 8,
//     name: "Evisu Pants",
//     price: 100,
//     images: [
//       {
//         url: "https://picsum.photos/500/500?random=37",
//       },
//     ],
//   },
// ];

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);
  useEffect(() => {
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        category: "Bottom Wear",
        limit: 8,
      }),
    );
    //Fetch best seller product
    const fetchBestSeller = async()=>{
      try {
              const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`);
      setBestSellerProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBestSeller();
  }, [dispatch]);
  return (
    <div>
      <Hero />
      <GenderCollectionSection />
      <NewArrivals />

      <h2 className="text-3xl text-center font-bold mb-4">BestSeller</h2>
      {bestSellerProduct? <ProductDetails productId={bestSellerProduct._id}/>:(<p className="text-center">loading best seller product ...</p>)}
      <div className="container mx-auto">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top Wear's for Women
        </h2>
        <ProductGrid products={products} loading={loading} error={error}/>
      </div>
      <FeaturedCollections />
      <FeaturesSection />
    </div>
  );
};

export default Home;
