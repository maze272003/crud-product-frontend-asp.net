import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import the styling

// ⚠️ CHANGE THIS TO YOUR ACTUAL BACKEND URL
const API_BASE_URL = "https://api.frontend.hostcluster.site"; 

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  // State for the Image Preview Modal
  const [previewImage, setPreviewImage] = useState(null);

  // 1. Fetch Products on Load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // 2. Handle Add Product
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
      
      // Reset Form
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      document.getElementById("fileInput").value = ""; 
      
      fetchProducts(); 
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  // 3. Handle Delete
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