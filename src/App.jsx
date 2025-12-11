import React, { useState, useEffect } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr"; // 💡 NEW: Import the SignalR library
import "./App.css";

// Base URLs
const API_BASE_URL = "https://api.frontend.hostcluster.site"; 
// ⚠️ SIGNALR URL: Dapat tugma ito sa 'app.MapHub' endpoint sa Program.cs
const WS_URL_SIGNALR = "https://api.frontend.hostcluster.site/ws/products"; 

const CACHE_KEY = "storeManagerProductsCache"; 

function App() {
  // 1. Initialize 'products' state by checking localStorage first
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error("Error reading from local storage:", e);
      return [];
    }
  });

  // Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  // State for the Image Preview Modal
  const [previewImage, setPreviewImage] = useState(null);

  // Function to fetch products and update the cache
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      
      setProducts(response.data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(response.data));

    } catch (error) {
      console.error("Error fetching products:", error);
      if (products.length > 0) {
           console.warn("Could not fetch latest data. Showing cached data.");
      }
    }
  };
  
  // 2. LIFECYCLE HOOKS

  // A. Initial Data Fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // B. SignalR Setup for Realtime Updates 💡 NEW HOOK
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
        // Gamitin ang tamang URL at i-configure ang CORS
        .withUrl(WS_URL_SIGNALR, { withCredentials: true }) 
        .withAutomaticReconnect() // Awtomatikong magre-reconnect kung maputol
        .build();
    
    // Simulan ang connection
    connection.start()
        .then(() => console.log("SignalR Connected! Realtime updates enabled."))
        .catch(err => console.error("SignalR Connection Error: ", err));

    // Mag-subscribe sa event na ipinadala ng ASP.NET Controller
    // Tandaan: Ang pangalan ng method ay "ReceiveUpdate"
    connection.on("ReceiveUpdate", (eventType) => {
        console.log(`Realtime Event Received: ${eventType}. Refreshing products.`);
        // Kapag may natanggap na event (product_added, product_deleted, etc.), 
        // i-re-fetch ang listahan para maipakita ang pinakabagong data
        fetchProducts(); 
    });

    // Cleanup function: Tiyakin na nag-stop ang connection kapag umalis sa page
    return () => {
        connection.stop();
        console.log("SignalR connection closed.");
    };
  }, []); // [] ensures this runs only once on mount

  // 3. Handle Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Reset Form fields
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      document.getElementById("fileInput").value = ""; 
      
      // Kahit mag-trigger ang backend ng SignalR, tinatawag pa rin natin ito
      // para maging instant ang update sa lokal na user.
      fetchProducts(); 
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  // 4. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="container">
      <h1>Simple Store Manager</h1>

      {/* --- INPUT FORM --- */}
      <div className="form-container">
        <form onSubmit={handleAddProduct} className="responsive-form">
          <input
            className="input-field"
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
           <input
            className="input-field"
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            id="fileInput"
            className="file-input"
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <button type="submit" className="add-btn">
            Add Product
          </button>
        </form>
      </div>

      {/* --- PRODUCT LIST --- */}
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              {/* IMAGE PREVIEW TRIGGER */}
              {product.imagePath && (
                <img
                  src={`${API_BASE_URL}${product.imagePath}`} 
                  alt={product.name}
                  className="product-thumb"
                  title="Double click (or double tap) to preview"
                  onDoubleClick={() => setPreviewImage(`${API_BASE_URL}${product.imagePath}`)}
                />
              )}
              
              <div className="product-details">
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                {product.description && <span className="product-desc">{product.description}</span>}
              </div>
            </div>

            <button
              onClick={() => handleDelete(product.id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* --- FULL SCREEN MODAL --- */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-content">
             <img src={previewImage} alt="Preview" className="modal-image" />
             <p className="modal-instruction">Tap anywhere to close</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;