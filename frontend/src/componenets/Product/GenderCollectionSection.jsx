import React from 'react'
import { Link } from 'react-router-dom';

const GenderCollectionSection = () => {
  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 px-6">
        <div className="relative flex-1">
          <img
            src="https://images.squarespace-cdn.com/content/v1/5534a426e4b0ed810ce8f891/1612624805866-YI9XBLKU4HFG4Q5GP8UC/HEADER.jpg?format=1500w"
            alt=""
            className="w-full h-175 object-cover"
          />
          <div className="absolute bottom-8 left-8 bg-white/90 p-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Women's collection
            </h2>
            <Link
              to={`/collections/all?gender=Women`}
              className="text-gray-900 underline"
            >
              Shop Now
            </Link>
          </div>
        </div>
        <div className="relative flex-1 ">
          <img
            src="https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/cg_6_4.jpg"
            alt=""
            className="w-full h-175 object-cover"
          />
          <div className="absolute bottom-8 left-8 bg-white/90 p-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Men's collection
            </h2>
            <Link
              to={`/collections/all?gender=Women`}
              className="text-gray-900 underline"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GenderCollectionSection