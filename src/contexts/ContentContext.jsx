import { createContext, useContext, useEffect, useState } from 'react';

const ContentContext = createContext();

const defaultContent = {
  siteSettings: {
    artistName: 'Bronwen Artist',
    favicon: '',
  },
  home: {
    title: 'Bronwen Artist',
    subtitle: 'Visual Artist & Photographer',
    ctaText: 'View Work',
    backgroundImage: '',
    backgroundColor: '#f5f0e8',
  },
  about: {
    profileImage: '',
    bioTitle: 'ABOUT',
    bioText: `Bronwen Artist (she/they) is a Canadian artist working within expanded realms of photography and image making. Of Scottish/French settler ancestry, she was raised in Northern Ontario (Treaty 9 Territory) and currently resides in Kjipuktuk/Halifax.

She holds an MFA from NSCAD University and a BFA in Photography and Film Studies from the University of Ottawa. Her practice, although rooted in analog photography, consists of diverse material explorations, including the use of found objects and performance.

Her work often revolves around concepts of instability and entanglement, and seeks an empathic approach to destructive human tendencies.`,
  },
  contact: {
    title: 'Contact',
    content: '',
    email: 'contact@bronwenartist.com',
    phone: '',
    instagram: 'https://instagram.com/bronwenartist',
    facebook: 'https://facebook.com/bronwenartist',
    twitter: '',
    linkedin: '',
    locationName: '',
    locationUrl: '',
  },
  gallery: {
    title: 'Gallery',
    items: [],
  },
  exhibitions: [
    {
      id: '1',
      title: 'Chronotopes of Contamination',
      year: '2025',
      venue: 'Anna Leonowens Gallery',
      location: 'Halifax, NS',
      description: 'A solo exhibition exploring the intersection of time and environmental decay through a series of large-scale photographs and installations.',
      images: [],
    },
    {
      id: '2',
      title: 'Eulogy',
      year: '2024',
      venue: 'Centre for Art Tapes',
      location: 'Halifax, NS',
      description: 'A meditation on loss and remembrance through analog photography and sound installation.',
      images: [],
    },
    {
      id: '3',
      title: 'Other Work',
      year: '2023',
      venue: 'Various Locations',
      location: 'Canada',
      description: 'A collection of collaborative and experimental works from the past year.',
      images: [],
    },
  ],
};

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem('artistPortfolioContent');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all required sections exist by merging with defaults
        return {
          ...defaultContent,
          ...parsed,
          siteSettings: { ...defaultContent.siteSettings, ...(parsed.siteSettings || {}) },
          home: { ...defaultContent.home, ...(parsed.home || {}) },
          about: { ...defaultContent.about, ...(parsed.about || {}) },
          contact: { ...defaultContent.contact, ...(parsed.contact || {}) },
          gallery: { ...defaultContent.gallery, ...(parsed.gallery || {}) },
          exhibitions: parsed.exhibitions || defaultContent.exhibitions,
        };
      }
    } catch (e) {
      console.error('Error loading content:', e);
    }
    return defaultContent;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('artistPortfolioContent', JSON.stringify(content));
  }, [content]);

  const login = (email, password) => {
    // Default credentials - in production, use proper authentication
    if (email === 'admin@artist.com' && password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
  };

  const updateContent = (section, data) => {
    setContent((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const updateSiteSettings = (settings) => {
    setContent((prev) => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, ...settings },
    }));
  };

  const addGalleryItem = (item, index = null) => {
    setContent((prev) => {
      const newItems = [...prev.gallery.items];
      const newItem = { ...item, id: Date.now().toString() };
      if (index !== null && index >= 0 && index <= newItems.length) {
        newItems.splice(index, 0, newItem);
      } else {
        newItems.push(newItem);
      }
      return {
        ...prev,
        gallery: { ...prev.gallery, items: newItems },
      };
    });
  };

  const updateGalleryItem = (id, data) => {
    setContent((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        items: prev.gallery.items.map((item) =>
          item.id === id ? { ...item, ...data } : item
        ),
      },
    }));
  };

  const removeGalleryItem = (id) => {
    setContent((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        items: prev.gallery.items.filter((item) => item.id !== id),
      },
    }));
  };

  const reorderGalleryItems = (startIndex, endIndex) => {
    setContent((prev) => {
      const newItems = [...prev.gallery.items];
      const [removed] = newItems.splice(startIndex, 1);
      newItems.splice(endIndex, 0, removed);
      return {
        ...prev,
        gallery: { ...prev.gallery, items: newItems },
      };
    });
  };

  const addExhibition = (exhibition) => {
    setContent((prev) => ({
      ...prev,
      exhibitions: [...prev.exhibitions, { ...exhibition, id: Date.now().toString() }],
    }));
  };

  const updateExhibition = (id, data) => {
    setContent((prev) => ({
      ...prev,
      exhibitions: prev.exhibitions.map((ex) =>
        ex.id === id ? { ...ex, ...data } : ex
      ),
    }));
  };

  const removeExhibition = (id) => {
    setContent((prev) => ({
      ...prev,
      exhibitions: prev.exhibitions.filter((ex) => ex.id !== id),
    }));
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        isAuthenticated,
        login,
        logout,
        updateContent,
        updateSiteSettings,
        addGalleryItem,
        updateGalleryItem,
        removeGalleryItem,
        reorderGalleryItems,
        addExhibition,
        updateExhibition,
        removeExhibition,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
