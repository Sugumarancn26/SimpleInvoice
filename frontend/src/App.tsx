import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute.tsx';
import { InvoiceCreate } from './pages/InvoiceCreate.tsx';
import { InvoiceDetail } from './pages/InvoiceDetail.tsx';
import { InvoiceList } from './pages/InvoiceList.tsx';
import { Login } from './pages/Login.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<InvoiceList />} />
        <Route path="/invoices/new" element={<InvoiceCreate />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
      </Route>
    </Routes>
  );
}
