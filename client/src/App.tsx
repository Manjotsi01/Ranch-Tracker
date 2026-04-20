import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard';
import AgricultureIndex from './pages/agriculture';
import CropDetail from './pages/agriculture/CropDetail';
import SeasonDetail from './pages/agriculture/SeasonDetail';

// Dairy (lazy for code-splitting)
const DairyIndex   = lazy(() => import('./pages/dairy'));
const AnimalList   = lazy(() => import('./pages/dairy/AnimalList'));
const AnimalDetail = lazy(() => import('./pages/dairy/AnimalDetail'));
const FodderModule = lazy(() => import('./pages/dairy/FodderModule'));

// Shop (lazy as well to avoid chunk issues)
const ShopOverview = lazy(() => import('./pages/shop/dashboard'));
const POS          = lazy(() => import('./pages/shop/pos'));
const Processing   = lazy(() => import('./pages/shop/inventory/index'));
const SalesHistory = lazy(() => import('./pages/shop/reports'));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>
    {Component}
  </Suspense>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>

          {/* Default */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Agriculture */}
          <Route path="/agriculture" element={<AgricultureIndex />} />
          <Route path="/agriculture/crops/:cropId" element={<CropDetail />} />
          <Route path="/agriculture/seasons/:seasonId" element={<SeasonDetail />} />

          {/* Dairy */}
          <Route path="/dairy" element={withSuspense(<DairyIndex />)} />
          <Route path="/dairy/:type" element={withSuspense(<AnimalList />)} />
          <Route path="/dairy/:type/:id" element={withSuspense(<AnimalDetail />)} />
          <Route path="/dairy/fodder" element={withSuspense(<FodderModule />)} />

          {/* Shop */}
          <Route path="/shop" element={withSuspense(<ShopOverview />)} />
          <Route path="/shop/pos" element={withSuspense(<POS />)} />
          <Route path="/shop/processing" element={withSuspense(<Processing />)} />
          <Route path="/shop/sales" element={withSuspense(<SalesHistory />)} />

          {/* Fallback route (VERY IMPORTANT for Vercel refresh) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Route>
      </Routes>
    </BrowserRouter>   
  );
}