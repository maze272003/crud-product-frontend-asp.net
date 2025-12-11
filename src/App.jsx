import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// ⚠️ IBINALIK SA HARDCODED URL
const API_BASE_URL = "https://api.frontend.hostcluster.site"; 
const CACHE_KEY = "storeManagerProductsCache"; // Key to store products in localStorage

function App() {
  // Initialize 'products' state by checking localStorage first for faster initial load
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      // If cache exists, parse and return it; otherwise, return an empty array
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
      
      // Update state with the freshest data
      setProducts(response.data);
      
      // Update localStorage (Cache Update)
      localStorage.setItem(CACHE_KEY, JSON.stringify(response.data));

    } catch (error) {
      console.error("Error fetching products:", error);
      // Show warning if network fetch failed, but cached data is available
      if (products.length > 0) {
           console.warn("Could not fetch latest data. Showing cached data.");
      }
    }
  };
  
  // 1. Fetch Products on Component Mount (Initial Load)
  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Handle Add Product (Requires re-fetch to update the cache)
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
      // Reset file input element visually
      document.getElementById("fileInput").value = ""; 
      
      // Re-fetch the product list and update the cache
      fetchProducts(); 
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  // 3. Handle Delete (Requires re-fetch to update the cache)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      
      // Re-fetch the product list and update the cache
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
                  // Logic: Double click sets the state to show the modal
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
      {/* Renders only if previewImage has a value */}
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