import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState();
  const [canScrollLeft, setCanScrollLeft] = useState(true);

  // const newArrivals = [
  //   {
  //     _id: "1",
  //     name: "carhart Jackect",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=4",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "2",
  //     name: "carhart Jackect",
  //     price: 120,

  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=5",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "3",
  //     name: "carhart Jackect",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=6",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "4",
  //     name: "carhart Jackect",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=7",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "5",
  //     name: "carhart Jackect",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=8",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "6",
  //     name: "carhart Jackect",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=1",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "7",
  //     name: "carhart Jackect",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=2",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  //   {
  //     _id: "8",
  //     name: "carhart Jackect",
  //     price: 120,
  //     images: [
  //       {
  //         url: "https://picsum.photos/500/500?random=3",
  //         altText: "carhart",
  //       },
  //     ],
  //   },
  // ];
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`,
        );
        setNewArrivals(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNewArrivals();
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scroll = (direction) => {
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behaviour: "smooth" });
  };

  const updateScrollButtons = () => {
    const container = scrollRef.current;

    if (container) {
      const leftScroll = container.scrollLeft;
      const rightScrollable =
        container.scrollWidth > leftScroll + container.clientWidth;

      setCanScrollLeft(leftScroll > 0);
      setCanScrollRight(rightScrollable);
    }

    // console.log({
    //   scrollLeft: container.scrollLeft,
    //   clientWidth: container.clientWidth,
    //   containerScrollWidth: container.scrollWidth,
    // });
  };
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [newArrivals]);

  return (
    <section className="container mx-auto text-center mb-10 relative px-4 py-16 lg:px-0">
      <h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
      <p className="text-lg text-gray-600 mb-8">
        Discover the latest styles straight off the runway, freshly added to
        keep your wardrobe on the cutting edge of fashion
      </p>
      {/* scroll btns */}
      <div className="absolute right-0 -bottom-7.5 flex space-x-2 px-6">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`p-2 rounded border ${
            canScrollLeft
              ? " bg-white text-black"
              : "bg-gray-200 text-gray-400 cursor-not-allowed "
          } `}
        >
          <FiChevronLeft className="text-2xl" />
        </button>
        <button
          onClick={() => scroll("right")}
          className={`p-2 rounded border ${
            canScrollRight
              ? " bg-white text-black"
              : "bg-gray-200 text-gray-400 cursor-not-allowed "
          } `}
        >
          <FiChevronRight className="text-2xl" />
        </button>
      </div>

      {/* scrollable content */}
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUpOrLeave}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUpOrLeave}
        ref={scrollRef}
        className={`container mx-auto overflow-x-scroll flex space-x-6 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {newArrivals.map((product) => (
          <div
            key={product._id}
            className="min-w-full sm:min-w-[50%] lg:min-w-[30%] relative"
          >
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.altText || product.name}
              className="w-full h-125 object-cover rounded-lg "
              draggable={false}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-amber-50/50 backdrop-blur-md text-white p-4 rounded-b-lg">
              <Link to={`/products/${product._id}`} className="block">
                <h4 className="font-medium ">{product.name}</h4>
                <p className="mt-1">${product.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
