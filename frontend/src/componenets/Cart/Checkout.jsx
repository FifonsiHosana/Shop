import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import PaypalButton from "./PaypalButton";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slices/checkoutSlice";
import axios from "axios";
// import PaystackPop from "@paystack/inline-js";
import { initializePayment } from "../../redux/slices/paystackSlice";

// const paystackInstance = new PaystackPop();
// const cart = {
//   Products: [
//     {
//       name: "Evisu Jacket",
//       size: "M",
//       color: "Black",
//       price: 120,
//       image: "https://picsum.photos/150?random=1",
//     },
//     {
//       name: "Evisu Pants",
//       size: "S",
//       color: "Black",
//       price: 10,
//       image: "https://picsum.photos/150?random=2",
//     },
//   ],
//   totalPrice: 195,
// };

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { cart, error } = useSelector((state) => state.cart);
  const { loading } = useSelector((state) => state.checkout);
  const { paymentUrl } = useSelector((state) => state.payment);

  const [checkoutId, setCheckoutId] = useState(null);
  // const [checkoutItems, setCheckoutItems] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  //Ensure cart is not loaded before proceeding
  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, navigate, dispatch]);

  const paystackConvert = cart.totalPrice * 100;

  const handlePaystackPopupOnClick = async () => {
    //   paystackInstance.checkout({
    //   key: "pk_test_a57c910266bd39b940c65d81d04cbab62b0e2887",
    //   email: "Alhassan@gmail.com",
    //   amount: totalPrice,
    //   onSuccess: (transaction) => {
    //     handlePaymentSuccess();
    //     console.log(transaction);
    //   },
    //   onLoad: (response) => {
    //     console.log("onLoad: ", response);
    //   },
    //   onCancel: () => {
    //     console.log("Transaction Cancelled");
    //   },
    //   onError: (error) => {
    //     console.log("Error: ", error.message);
    //   },
    // });
  };

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    if (cart && cart.products.length > 0) {
      const res = await dispatch(
        createCheckout({
          checkoutItems: cart.products,
          shippingAddress,
          paymentMethod: "Paystack",
          totalPrice: cart.totalPrice,
        }),
      );
      if (res.payload && res.payload._id) {
        setCheckoutId(res.payload._id);
      }
    }
  };

  useEffect(() => {
    if (checkoutId) {
      localStorage.setItem("pendingCheckoutId", checkoutId);
     dispatch(initializePayment(checkoutId));
    }
  }, [checkoutId, dispatch,paymentUrl]);
  
  useEffect(() => {
    if (paymentUrl) {
      location.href = paymentUrl;
    }
  }, [checkoutId, dispatch, paymentUrl]);


  const handleFinalizeCheckout = async (checkoutId) => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        console.error("No token found!");
        navigate("/login?redirect=checkout");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      navigate("/order-confirmation");
    } catch (error) {
      console.error(error);
    }
  };

  // const handlePaymentSuccess = async (details) => {
  //   try {
  //     await axios.put(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
  //       { paymentStatus: "paid", paymentDetails: details },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  //         },
  //       },
  //     );

  //     await handleFinalizeCheckout(checkoutId);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  if (loading) return <p>loading cart...</p>;
  if (error) return <p>Error:{error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Your cart is empty</p>;
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* left section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4">Contact Details</h3>
          <div className="mb-4 ">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={user ? user.email : ""}
              className="w-full p-2 border rounded "
              disabled
            />
          </div>
          <h3 className="text-lg mb-4">Delivery</h3>
          <div className=" mb-4 grid grid-cols-2 gap-4">
            <div className="">
              <label htmlFor="" className="block text-gray-700">
                First Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
              />
            </div>
            <div className="">
              <label htmlFor="" className="block text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-4 ">
            <label className="block text-gray-700 ">Address</label>
            <input
              type="text "
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="">
              <label htmlFor="" className="block text-gray-700">
                City
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
              />
            </div>
            <div className="">
              <label htmlFor="" className="block text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-4 ">
            <label className="block text-gray-700 ">Country</label>
            <input
              type="text "
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 ">
            <label className="block text-gray-700 ">Phone Number</label>
            <input
              type="text "
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>{" "}
          <div className="mt-6">
            {!checkoutId && (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded"
              >
                Continue Payment
              </button>
            )}
            {/*  ) : (
              <div className=" ">
                <h3 className="text-lg mb-4 ">Pay with Paystack</h3>
                <button
                  className="bg-blue-300 p-3 text-2xl w-full text-center rounded-sm cursor-pointer hover:bg-blue-400 mb-7"
                  // onClick={() => handlePaystackPopupOnClick(paystackConvert)}
                >
                  Paystack
                </button>
                 <h3 className="text-lg mb-4">Pay with Paypal</h3>
                 <PaypalButton
                  amount={cart.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => alert("Payment failed:", { err })} 
                /> 
              </div>
            )}*/}
          </div>
        </form>
      </div>

      {/* right side */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order summary</h3>
        <div className="border-t py-4 mb-4 ">
          {cart.products.map((product, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-2 border-b"
            >
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt="product"
                  className="w-20 h-24 object-cover mr-4"
                />
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-gray-500">Size :{product.size}</p>
                  <p className="text-gray-500">Color :{product.color}</p>
                  <p className="text-xl">${product.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
          <p>Total</p>
          <p>${cart.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
