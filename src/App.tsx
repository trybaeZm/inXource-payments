import HomePage from './Pages/Homepage';
import PayForm from './Pages/payment/PayForm'
import CustomerInfoForm from './Pages/CustomerInfo';
import ProductSelectionForm from './Pages/payment/product/ProductForm';
import { Route, Routes } from 'react-router-dom';
import PayStatus from './Pages/PayStatus';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Alias wrapper */}
      <Route path="/:alias">
        <Route index element={<PayForm />} />
        <Route path="info" element={<CustomerInfoForm />} />
        <Route path="product" element={<ProductSelectionForm />} />
        <Route path="status/:id" element={<PayStatus />} />
      </Route>
    </Routes>
  );
}

export default App;