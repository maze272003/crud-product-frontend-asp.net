import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// ---------------------------------------------------------
// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR ASP.NET BACKEND PORT
// Check your dotnet terminal for "Now listening on..."
// ---------------------------------------------------------
const API_BASE_URL = "https://api.frontend.hostcluster.site"; 

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

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

  // 2. Handle Add Product (with Image)
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Clear form and refresh list
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      // Reset file input manually if needed using a ref, strictly optional for now
      document.getElementById("fileInput").value = ""; 
      
      fetchProducts(); 
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Simple Store Manager</h1>

      {/* INPUT FORM */}
      <div style={{ marginBottom: "30px", background: "#222", padding: "20px", borderRadius: "8px" }}>
        <form onSubmit={handleAddProduct} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: "8px" }}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ padding: "8px" }}
          />
           <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: "8px" }}
          />
          <input
            id="fileInput"
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ color: "white" }}
          />
          <button type="submit" style={{ padding: "8px 16px", cursor: "pointer", background: "blue", color: "white", border: "none" }}>
            Add Product
          </button>
        </form>
      </div>

      {/* PRODUCT LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#333",
              padding: "10px",
              borderRadius: "5px",
              color: "white"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              {/* --- HERE IS THE FIX FOR THE IMAGE --- */}
              {product.imagePath && (
                <img
                  src={`${API_BASE_URL}${product.imagePath}`} 
                  alt={product.name}
                  style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", backgroundColor: "white" }}
                />
              )}
              
              <div>
                <h3 style={{ margin: 0 }}>{product.name}</h3>
                <p style={{ margin: 0, color: "#aaa" }}>${product.price}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(product.id)}
              style={{ background: "red", color: "white", border: "none", padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;