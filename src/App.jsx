import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import AlgorithmPage from './pages/AlgorithmPage';
import PracticePage from './pages/PracticePage';
import ComparePage from './pages/ComparePage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="algo/:slug" element={<AlgorithmPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="compare" element={<ComparePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
