import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { defaultGalleryCategories } from '../data/galleryCategories';

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
    categories: defaultGalleryCategories,
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
  const [content, setContent] = useState(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [saveRevision, setSaveRevision] = useState(0);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [loadFailed, setLoadFailed] = useState(false);
  const saveSequence = useRef(0);
  const loadedContent = useRef(null);

  // Load content from server on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const data = await response.json();
          // Merge with defaults to ensure structure
          const merged = {
          ...defaultContent,
          ...data,
          siteSettings: { ...defaultContent.siteSettings, ...(data.siteSettings || {}) },
          home: { ...defaultContent.home, ...(data.home || {}) },
          about: { ...defaultContent.about, ...(data.about || {}) },
          contact: { ...defaultContent.contact, ...(data.contact || {}) },
          gallery: { ...defaultContent.gallery, ...(data.gallery || {}) },
          exhibitions: data.exhibitions || defaultContent.exhibitions,
          };
          loadedContent.current = merged;
          setContent(merged);
        } else if (response.status !== 404) {
          throw new Error(`Content load failed: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        setLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Save content to server whenever it changes (debounced could be better but this ensures sync)
  useEffect(() => {
    if (isLoading) return; // Don't save initial state if we haven't loaded yet
    // Saving after a failed load would overwrite data.json with defaults and the
    // server would then delete every upload. Visitors who only view the site never save.
    if (loadFailed || content === loadedContent.current) return;
    const sequence = ++saveSequence.current;

    const saveContent = async () => {
      setSaveStatus('saving');
      try {
        const response = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(content),
        });
        if (!response.ok) throw new Error(`Content save failed: ${response.status}`);
        setSaveRevision((revision) => revision + 1);
        if (sequence === saveSequence.current) setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to save content:', error);
        if (sequence === saveSequence.current) setSaveStatus('error');
      }
    };

    // Use a small timeout to avoid blocking UI and debounce slightly
    const timeoutId = setTimeout(saveContent, 500);
    return () => clearTimeout(timeoutId);
  }, [content, isLoading, loadFailed]);

  useEffect(() => {
    const favicon = content.siteSettings?.favicon;
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');

    link.rel = 'icon';
    if (favicon) {
      link.type = 'image/png';
      link.href = favicon;
      document.head.appendChild(link);
    } else if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  }, [content.siteSettings?.favicon]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  });

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

  const updateGalleryCategories = (categories) => {
    setContent((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, categories },
    }));
  };

  // Work in a removed subsection moves up to its parent; work in a removed section becomes uncategorized.
  const removeGalleryCategory = (id) => {
    setContent((prev) => {
      const { categories, items } = prev.gallery;
      const parent = categories.find((category) => category.children.some((child) => child.id === id));
      const removed = parent
        ? [id]
        : [id, ...(categories.find((category) => category.id === id)?.children || []).map((child) => child.id)];
      const fallback = parent ? parent.id : '';
      return {
        ...prev,
        gallery: {
          ...prev.gallery,
          categories: parent
            ? categories.map((category) => category === parent
              ? { ...category, children: category.children.filter((child) => child.id !== id) }
              : category)
            : categories.filter((category) => category.id !== id),
          items: items.map((item) => removed.includes(item.category)
            ? { ...item, category: fallback }
            : item),
        },
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
        isLoading,
        saveRevision,
        saveStatus,
        loadFailed,
        isAuthenticated,
        login,
        logout,
        updateContent,
        updateSiteSettings,
        addGalleryItem,
        updateGalleryItem,
        removeGalleryItem,
        reorderGalleryItems,
        updateGalleryCategories,
        removeGalleryCategory,
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
