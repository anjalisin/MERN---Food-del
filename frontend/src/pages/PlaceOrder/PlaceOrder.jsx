import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Razorpay SDK failed to load. Please refresh and try again.");
      return;
    }

    // collect items
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    const totalAmount = getTotalCartAmount();
    const deliveryFee = totalAmount === 0 ? 0 : 2;
    const finalAmount = totalAmount + deliveryFee;

    const orderData = {
      userId: token?.userId,
      address: data,
      items: orderItems,
      amount: finalAmount,
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token }
      });

      if (response.data.success) {
        const { amount, razorpayOrderId, key, currency, orderId } = response.data;

        const options = {
          key,
          amount,
          currency,
          name: "Food Delivery App",
          description: "Order Payment",
          order_id: razorpayOrderId,
          handler: function (res) {
            // ✅ Redirect to verify page with Razorpay details
            window.location.href = `/verify?razorpay_order_id=${res.razorpay_order_id}&razorpay_payment_id=${res.razorpay_payment_id}&razorpay_signature=${res.razorpay_signature}&orderId=${orderId}`;
          },
          prefill: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            contact: data.phone || "9999999999",
          },
          notes: {
            address: `${data.street}, ${data.city}, ${data.state}, ${data.zipcode}`,
          },
          theme: {
            color: "#000",
          },
        };

        const razor = new window.Razorpay(options);
        razor.on("payment.failed", function (response) {
          console.error("Payment Failed:", response.error);
          alert("Payment Failed: " + response.error.description);
          window.location.href = `/verify?success=false&orderId=${orderId}`;
        });
        razor.open();
      } else {
        alert("Order creation failed.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong.");
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/cart')
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart')
    }
  }, [token])

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information </p>
        <div className="multi-field">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-field">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-field">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <b>${getTotalCartAmount() + (getTotalCartAmount() === 0 ? 0 : 2)}</b>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
