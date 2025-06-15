import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Homepage';
import PayForm from './Pages/PayForm'
import CustomerInfoForm from './Pages/CustomerInfo';
import ProductSelectionForm from './Pages/ProductForm';
function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/payment/:alias" element={<PayForm />} />
        <Route path="/payment/info" element={<CustomerInfoForm />} />
        <Route path="/payment/product" element={<ProductSelectionForm />} />
      </Routes>
  );
}

export default App;
