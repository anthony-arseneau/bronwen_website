import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import { useContent } from '../../contexts/ContentContext';
import GallerySectionsEditor from './GallerySectionsEditor';
import { getCategoryLabel, getCategoryOptions } from '../../data/galleryCategories';
import './EditorPages.css';
import './GalleryEditor.css';

function GalleryEditor() {
  const {
    content,
    isAuthenticated,
    addGalleryItem,
    updateGalleryItem,
    removeGalleryItem,
    reorderGalleryItems,
    updateContent,
  } = useContent();
  const navigate = useNavigate();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    image: '',
    title: '',
    caption: '',
    description: '',
    category: '',
  });
  const [insertIndex, setInsertIndex] = useState('');
  const [galleryTitle, setGalleryTitle] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('');
  const { categories } = content.gallery;
  const categoryOptions = getCategoryOptions(categories);
  const filterIds = sectionFilter && sectionFilter !== 'uncategorized'
    ? [sectionFilter, ...(categories.find((category) => category.id === sectionFilter)?.children || [])
      .map((child) => child.id)]
    : null;
  // Keep each item's position in the full list so reordering works while filtered.
  const visibleItems = content.gallery.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (sectionFilter === 'uncategorized') return !categoryOptions.some((option) => option.value === item.category);
      return !filterIds || filterIds.includes(item.category);
    });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/edit');
    }
  }, [isAuthenticated, navigate]);

  const showSaveAnimation = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleAddItem = () => {
    if (!newItem.image || !newItem.title) return;
    const index = insertIndex !== '' ? parseInt(insertIndex) : null;
    addGalleryItem(newItem, index);
    setNewItem({ image: '', title: '', caption: '', description: '', category: '' });
    setInsertIndex('');
    showSaveAnimation();
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    updateGalleryItem(editingItem.id, editingItem);
    setEditingItem(null);
    showSaveAnimation();
  };

  const handleRemoveItem = (id) => {
    if (confirm('Are you sure you want to remove this item?')) {
      removeGalleryItem(id);
      showSaveAnimation();
    }
  };

  // Moves swap with the neighbouring visible item, so a filtered list reorders as shown.
  const handleMoveUp = (visibleIndex) => {
    if (visibleIndex > 0) {
      reorderGalleryItems(visibleItems[visibleIndex].index, visibleItems[visibleIndex - 1].index);
    }
  };

  const handleMoveDown = (visibleIndex) => {
    if (visibleIndex < visibleItems.length - 1) {
      reorderGalleryItems(visibleItems[visibleIndex].index, visibleItems[visibleIndex + 1].index);
    }
  };

  const handleSaveTitle = () => {
    updateContent('gallery', {
      ...content.gallery,
      title: galleryTitle ?? content.gallery.title,
    });
    setGalleryTitle(null);
    showSaveAnimation();
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout showSaveSuccess={showSaveSuccess}>
      <div className="editor-page">
        <h2 className="editor-title">Gallery Editor</h2>

        {/* Gallery Title */}
        <div className="editor-section">
          <h3>Gallery Title</h3>
          <div className="inline-edit">
            <input
              type="text"
              value={galleryTitle ?? content.gallery.title}
              onChange={(e) => setGalleryTitle(e.target.value)}
            />
            <button onClick={handleSaveTitle} className="save-btn">
              Save
            </button>
          </div>
        </div>

      <GallerySectionsEditor onChange={showSaveAnimation} />

      {/* Add New Item */}
      <div className="editor-section">
        <h3>Add New Item</h3>
        <div className="add-item-form">
          <div className="form-row">
            <div className="form-group image-upload-field">
              <ImageUpload
                onUpload={(url) => setNewItem({ ...newItem, image: url })}
                currentImage={newItem.image}
                label="Artwork Image"
              />
            </div>
            <div className="form-group-stack">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Artwork Title"
                />
              </div>
              <div className="form-group">
                <label>Caption</label>
                <input
                  type="text"
                  value={newItem.caption}
                  onChange={(e) => setNewItem({ ...newItem, caption: e.target.value })}
                  placeholder="Medium, Year"
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-item-category">Section</label>
                <select
                  id="new-item-category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="">Uncategorized</option>
                  {categoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Artwork description..."
                  rows={2}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Insert at Position</label>
                  <input
                    type="number"
                    min="0"
                    max={content.gallery.items.length}
                    value={insertIndex}
                    onChange={(e) => setInsertIndex(e.target.value)}
                    placeholder="End"
                  />
                </div>
              </div>
            </div>
          </div>
          <button onClick={handleAddItem} className="add-btn">
            Add Item
          </button>
        </div>
      </div>

      {/* Gallery Items List */}
      <div className="editor-section">
        <h3>Gallery Items ({content.gallery.items.length})</h3>
        <div className="items-filter">
          <label htmlFor="items-section-filter">Show</label>
          <select
            id="items-section-filter"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
          >
            <option value="">All sections</option>
            <option value="uncategorized">Uncategorized</option>
            {categoryOptions.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          {sectionFilter && <span>{visibleItems.length} shown</span>}
        </div>
        <div className="items-list">
          {visibleItems.map(({ item }, index) => (
            <div key={item.id} className="item-row">
              <div className="item-order">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="order-btn"
                >
                  ↑
                </button>
                <span className="order-number">{index + 1}</span>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === visibleItems.length - 1}
                  className="order-btn"
                >
                  ↓
                </button>
              </div>

              <div className="item-preview">
                <img src={item.image} alt={item.title} />
              </div>

              <div className="item-info">
                {editingItem?.id === item.id ? (
                  <div className="edit-form">
                    <div className="edit-image-upload">
                      <ImageUpload
                        onUpload={(url) => setEditingItem({ ...editingItem, image: url })}
                        currentImage={editingItem.image}
                        label="Image"
                      />
                    </div>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, title: e.target.value })
                      }
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={editingItem.caption}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, caption: e.target.value })
                      }
                      placeholder="Caption"
                    />
                    <label htmlFor={`item-category-${item.id}`}>Section</label>
                    <select
                      id={`item-category-${item.id}`}
                      value={editingItem.category || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, category: e.target.value })
                      }
                    >
                      <option value="">Uncategorized</option>
                      {categoryOptions.map((category) => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, description: e.target.value })
                      }
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="edit-actions">
                      <button onClick={handleUpdateItem} className="save-btn">
                        Save
                      </button>
                      <button onClick={() => setEditingItem(null)} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4>{item.title}</h4>
                    <p>{item.caption}</p>
                    <p>Section: {getCategoryLabel(categories, item.category)}</p>
                    {item.description && <p className="item-description-preview">{item.description}</p>}
                  </>
                )}
              </div>

              {editingItem?.id !== item.id && (
                <div className="item-actions">
                  <button onClick={() => setEditingItem({ ...item })} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleRemoveItem(item.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}

export default GalleryEditor;
