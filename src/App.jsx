import { Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout/Layout';
import { ContentProvider } from './contexts/ContentContext';
import About from './pages/About/About';
import AboutEditor from './pages/Admin/AboutEditor';
import ContactEditor from './pages/Admin/ContactEditor';
import ExhibitionsEditor from './pages/Admin/ExhibitionsEditor';
import GalleryEditor from './pages/Admin/GalleryEditor';
import HomeEditor from './pages/Admin/HomeEditor';
import Login from './pages/Admin/Login';
import Contact from './pages/Contact/Contact';
import Exhibition from './pages/Exhibition/Exhibition';
import Gallery from './pages/Gallery/Gallery';
import Home from './pages/Home/Home';

function App() {
  return (
    <ContentProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="exhibitions/:id" element={<Exhibition />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Routes - No Layout wrapper for admin pages */}
        <Route path="/edit" element={<Login />} />
        <Route path="/edit/home" element={<HomeEditor />} />
        <Route path="/edit/gallery" element={<GalleryEditor />} />
        <Route path="/edit/about" element={<AboutEditor />} />
        <Route path="/edit/exhibitions" element={<ExhibitionsEditor />} />
        <Route path="/edit/contact" element={<ContactEditor />} />
      </Routes>
    </ContentProvider>
  );
}

export default App;
