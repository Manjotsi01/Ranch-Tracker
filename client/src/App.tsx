// client/src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/index';
import AgricultureIndex from './pages/agriculture/index';
import CropDetail from './pages/agriculture/CropDetail';
import SeasonDetail from './pages/agriculture/SeasonDetail';
const DairyIndex  = lazy(() => import('./pages/dairy/index'));
const AnimalList  = lazy(() => import('./pages/dairy/AnimalList'));
const AnimalDetail = lazy(() => import('./pages/dairy/AnimalDetail'));
const FodderModule = lazy(() => import('./pages/dairy/FodderModule'));
import ShopOverview from './pages/shop/index';
import POS from './pages/shop/POS';
import Processing from './pages/shop/Processing';
import SalesHistory from './pages/shop/SalesHistory';

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>

          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/agriculture" element={<AgricultureIndex />} />
          <Route path="/agriculture/crops/:cropId" element={<CropDetail />} />
          <Route path="/agriculture/seasons/:seasonId" element={<SeasonDetail />} />

          <Route path="/dairy" element={<Suspense fallback={<PageLoader />}><DairyIndex /></Suspense>} />
          <Route path="/dairy/:type"     element={<Suspense fallback={<PageLoader />}><AnimalList /></Suspense>} />
          <Route path="/dairy/:type/:id" element={<Suspense fallback={<PageLoader />}><AnimalDetail /></Suspense>} />
          <Route path="/dairy/fodder" element={<Suspense fallback={<PageLoader />}><FodderModule /></Suspense>} />

          <Route path="/shop"            element={<ShopOverview />} />
          <Route path="/shop/processing" element={<Processing />} />
          <Route path="/shop/pos"        element={<POS />} />
          <Route path="/shop/sales"      element={<SalesHistory />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}