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
        <Route path="/payment" element={<PayForm />} />
        <Route path="/payment/info" element={<CustomerInfoForm />} />
        <Route path="/payment/product" element={<ProductSelectionForm />} />
        <Route path="/payment/status/:id" element={<PayStatus />} />
      </Routes>
  );
}

export default App;