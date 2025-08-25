import React, { useState, useContext, useEffect } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
const MyOrders = () => {

    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);

    const fetchOrders = async () => {
        try {
            console.log("URL:", url);   // 👈 Add this line

            const response = await axios.get(url + "/api/order/userorders", {
                headers: { token }
            });
            setData(response.data.data);
            console.log(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    return (
        <div>

        </div>
    )
}

export default MyOrders