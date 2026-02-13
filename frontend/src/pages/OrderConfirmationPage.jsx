import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";
import { fetchCheckoutById } from "../redux/slices/checkoutSlice";

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {checkout, loading} = useSelector((state)=>state.checkout);

  // useEffect(() => {
  //   if (checkout && checkout._id) {
  //     dispatch(clearCart());
  //     localStorage.removeItem("cart");
  //   }else{
  //     navigate("/my-orders");
  //    }
  // }, [checkout,navigate, dispatch]);
    useEffect(() => {
      const pendingCheckoutId = localStorage.getItem("pendingCheckoutId");

      if (pendingCheckoutId) {
        dispatch(fetchCheckoutById(pendingCheckoutId));
        dispatch(clearCart());
        localStorage.removeItem("cart");
        localStorage.removeItem("pendingCheckoutId"); // 👈 clean up
      } else {
        navigate("/my-orders");
      }
    }, [dispatch, navigate]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orederDate = new Date(createdAt);
    orederDate.setDate(orederDate.getDate() + 10);
    return orederDate.toLocaleDateString();
  };


  if (loading) return <p>Loading your order...</p>;
  if (!checkout) return null;

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
