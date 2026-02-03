import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";

// const checkout = {
//   _id: "12345",
//   createdAt: new Date(),
//   checkoutItems: [
//     {
//       productId: "1",
//       name: "Jacket",
//       color: "black",
//       size: "M",
//       price: 150,
//       quantity: 1,
//       image: "https://picsum.photos/150?random=1",
//     },
//     {
//       productId: "2",
//       name: "Shirt",
//       color: "black",
//       size: "M",
//       price: 150,
//       quantity: 3,
//       image: "https://picsum.photos/150?random=3",
//     },
//   ],
//   shippingAddress: {
//     address: "123 BB street",
//     city: "Adenta",
//     country: "Ghana",
//   },
// };

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkout } = useSelector((state) => state.checkout);

  useEffect(() => {
    if (checkout && checkout._id) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    }else{
      navigate("/my-order");
    }
  }, [checkout,navigate, dispatch]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orederDate = new Date(createdAt);
    orederDate.setDate(orederDate.getDate() + 10);
    return orederDate.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white ">
      <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">
        Thankyou for your order!
      </h1>
      {checkout && (
        <div className="p-6 rounded-lg border">
          <div className="flex justify-between mb-20">
            <div className="">
              <h2 className="text-xl font-semibold">
                {" "}
                Order ID:{checkout._id}
              </h2>
              <p className="text-gray-500 ">
                Order date: {new Date(checkout.createdAt).toLocaleDateString()}
              </p>
            </div>
            {/* Estimated Delivery */}
            <div>
              <p className="text-emerald-700 text-sm">
                Estimated Delivery:{" "}
                {calculateEstimatedDelivery(checkout.createdAt)}
              </p>
            </div>
          </div>
          {/* Oredered Items */}

          <div className="mb-20 ">
            {checkout.checkoutItems.map((item) => (
              <div className="flex items-center mb-4" key={item.productId}>
                <img
                  src={item.image}
                  alt="imageid"
                  className=" w-16 h-16 object-cover rounded-md mr-4"
                />
                <div className=" ">
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    {item.color} | {item.size}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font ">${item.price}</p>
                  <div className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Payment & delivery */}
          <div className="grid grid-cols-2 gap-8">
            <div className="">
              <h4 className="text-lg font-semibold mb-2">Payment</h4>
              <p className="text-gray-600">Paypal</p>
            </div>

            {/* Delivery */}
            <div className="">
              <h4 className="text-lg font-semibold mb-2">Delivery</h4>
              <p className="text-gray-600">
                {checkout.shippingAddress.address}
              </p>
              <p className="text-gray-600">
                {checkout.shippingAddress.city},{" "}
                {checkout.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmationPage;
