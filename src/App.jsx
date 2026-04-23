import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import CategoryForm from "./pages/CategoryForm";
import Sales from "./pages/Sales";
import SalesReceipt from "./pages/SalesReceipt";
import Testimonials from "./pages/Testimonials";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";
import Leads from "./pages/Leads";
import Proposals from "./pages/Proposals";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id" element={<CategoryForm />} />
          <Route
            path="sales"
            element={
              <SuperAdminRoute>
                <Sales />
              </SuperAdminRoute>
            }
          />
          <Route
            path="sales/:id"
            element={
              <SuperAdminRoute>
                <SalesReceipt />
              </SuperAdminRoute>
            }
          />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="leads" element={<Leads />} />
          <Route path="proposals" element={<Proposals />} />
          <Route
            path="settings"
            element={
              <SuperAdminRoute>
                <Settings />
              </SuperAdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
