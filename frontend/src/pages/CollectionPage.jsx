import React, { useEffect, useRef, useState } from "react";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../componenets/Product/FilterSidebar";
import ProductGrid from "../componenets/Product/ProductGrid";
import SortOptions from "../componenets/Product/SortOptions";
import { useParams,useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productSlice";


const CollectionPage = () => {
  const {collection} = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state)=>state.products);
  const queryParams = Object.fromEntries([...searchParams])
  // const [products, setProducts] = useState([]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSideBarOpen] = useState(false);
  
  useEffect(()=>{
    dispatch(fetchProductsByFilters({collection, ...queryParams}))
  },[dispatch, collection,searchParams])
  
  const toggleSidebar = () => {
    setIsSideBarOpen(!isSidebarOpen);
  };

  const handleClickOutisde = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSideBarOpen(false);
    }
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutisde);
    document.removeEventListener("touchstart", handleClickOutisde);
  },[sidebarRef,handleClickOutisde]);


  
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile filter */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden border p-2 flex justify-center items-center"
      >
        <FaFilter className="mr-2" />
        Filters
      </button>

      {/* filter sidebar */}
      <div
        ref={sidebarRef}
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}
      >
        <FilterSidebar />
      </div>
      <div className="grow p-4">
        <h2 className="text-2xl uppercase mb-4">All collections</h2>
<SortOptions/>
        <ProductGrid products={products} loading={loading} error={error}/>
      </div>
      
    </div>
  );
};

export default CollectionPage;
