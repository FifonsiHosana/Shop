import { Link } from "react-router-dom";
import feature from "../../assets/featured.webp"

const FeaturedCollections = () => {
  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto flex flex-col lg:flex-row items-center bg-green-50 rounded-3xl">
        <div className="lg:w-1/2 p-8 text-center lg:text-left">
          <h2
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Comfort and Style
          </h2>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Apparel made for everyday life
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Dicsover high quality, comfortable clothing that effortlessly blends
            fashion and function. Designed to make you look and feel great
            everyday.
          </p>
          <Link
            to="/collections/all"
            className="bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800"
          >
            Shop Now
          </Link>
        </div> {/* Content on the right */}
        <div className="lg:w-1/2">
        <img className="w-full h-full object-cover lg:rounded-tr-3xl lg:rounded-br-3xl" src={feature} alt="Featured collection"/>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
