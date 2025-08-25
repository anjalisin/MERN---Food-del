import React, { useEffect, useContext } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { url, token: contextToken } = useContext(StoreContext);

    const token = contextToken || localStorage.getItem("token");

    //  Grab Razorpay params from URL
    const razorpay_order_id = searchParams.get("razorpay_order_id");
    const razorpay_payment_id = searchParams.get("razorpay_payment_id");
    const razorpay_signature = searchParams.get("razorpay_signature");
    const orderId = searchParams.get("orderId");

    const verifyPayment = async () => {
        try {
            const response = await axios.post(
                url + "/api/order/verify",
                {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                    orderId,
                },
                { headers: { token } } // send token with request
            );

            if (response.data.success) {
                navigate("/myorders");
            } else {
                console.log("Verification failed response:", response.data);
                // navigate("/");
            }
        } catch (err) {
            console.error("Verification failed:", err);
            navigate("/");
        }
    };

    useEffect(() => {
        if (razorpay_order_id && razorpay_payment_id && razorpay_signature && orderId) {
            verifyPayment();
        } else {
            console.error("Missing payment parameters in URL");
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="verify">
            <div className="spinner"></div>
            <p>Verifying your payment, please wait...</p>
        </div>
    );
};

export default Verify;
