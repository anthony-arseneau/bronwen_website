import { Outlet } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Footer from '../Footer/Footer';
import Navbar from '../Navbar/Navbar';
import './Layout.css';

function Layout() {
  const { content } = useContent();
  const backgroundColor = content?.home?.backgroundColor || '#f5f0e8';

  return (
    <div className="layout" style={{ backgroundColor }}>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
