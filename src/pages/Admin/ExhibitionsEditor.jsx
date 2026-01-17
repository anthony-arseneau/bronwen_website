import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import { useContent } from '../../contexts/ContentContext';
import './EditorPages.css';
import './ExhibitionsEditor.css';

function ExhibitionsEditor() {
  const {
    content,
    isAuthenticated,
    addExhibition,
    updateExhibition,
    removeExhibition,
    updateContent,
  } = useContent();
  const navigate = useNavigate();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState(null);
  const [newExhibition, setNewExhibition] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    venue: '',
    location: '',
    description: '',
    images: [],
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

  const handleAddExhibition = () => {
    if (!newExhibition.title) return;
    addExhibition(newExhibition);
    setNewExhibition({
      title: '',
      year: new Date().getFullYear().toString(),
      venue: '',
      location: '',
      description: '',
      images: [],
    });
    showSaveAnimation();
  };

  const handleUpdateExhibition = () => {
    if (!editingExhibition) return;
    updateExhibition(editingExhibition.id, editingExhibition);
    setEditingExhibition(null);
    showSaveAnimation();
  };

  const handleRemoveExhibition = (id) => {
    if (confirm('Are you sure you want to remove this exhibition?')) {
      removeExhibition(id);
      showSaveAnimation();
    }
  };

  const handleNewImageUpload = (url) => {
    if (url) {
      setNewExhibition({
        ...newExhibition,
        images: [...newExhibition.images, url],
      });
    }
  };

  const handleEditImageUpload = (url, index) => {
    if (!editingExhibition) return;
    const newImages = [...editingExhibition.images];
    if (url) {
      newImages[index] = url;
    } else {
      newImages.splice(index, 1);
    }
    setEditingExhibition({ ...editingExhibition, images: newImages });
  };

  const handleAddEditImage = (url) => {
    if (!editingExhibition || !url) return;
    setEditingExhibition({
      ...editingExhibition,
      images: [...editingExhibition.images, url],
    });
  };

  const handleRemoveNewImage = (index) => {
    const newImages = [...newExhibition.images];
    newImages.splice(index, 1);
    setNewExhibition({ ...newExhibition, images: newImages });
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const exhibitions = [...content.exhibitions];
      [exhibitions[index - 1], exhibitions[index]] = [exhibitions[index], exhibitions[index - 1]];
      updateContent('exhibitions', exhibitions);
    }
  };

  const handleMoveDown = (index) => {
    if (index < content.exhibitions.length - 1) {
      const exhibitions = [...content.exhibitions];
      [exhibitions[index], exhibitions[index + 1]] = [exhibitions[index + 1], exhibitions[index]];
      updateContent('exhibitions', exhibitions);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout showSaveSuccess={showSaveSuccess}>
      <div className="editor-page">
        <h2 className="editor-title">Exhibitions Editor</h2>

        {/* Add New Exhibition */}
        <div className="editor-section">
        <h3>Add New Exhibition</h3>
        <div className="add-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newExhibition.title}
                onChange={(e) =>
                  setNewExhibition({ ...newExhibition, title: e.target.value })
                }
                placeholder="Exhibition Title"
              />
            </div>
            <div className="form-group small">
              <label>Year</label>
              <input
                type="text"
                value={newExhibition.year}
                onChange={(e) =>
                  setNewExhibition({ ...newExhibition, year: e.target.value })
                }
                placeholder="2024"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                value={newExhibition.venue}
                onChange={(e) =>
                  setNewExhibition({ ...newExhibition, venue: e.target.value })
                }
                placeholder="Gallery Name"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newExhibition.location}
                onChange={(e) =>
                  setNewExhibition({ ...newExhibition, location: e.target.value })
                }
                placeholder="City, Country"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newExhibition.description}
              onChange={(e) =>
                setNewExhibition({ ...newExhibition, description: e.target.value })
              }
              placeholder="About this exhibition..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Images</label>
            <div className="images-grid">
              {newExhibition.images.map((img, index) => (
                <div key={index} className="image-preview-small">
                  <img src={img} alt={`Preview ${index + 1}`} />
                  <button
                    onClick={() => handleRemoveNewImage(index)}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="add-image-zone">
                <ImageUpload
                  key={newExhibition.images.length}
                  onUpload={handleNewImageUpload}
                  label=""
                />
              </div>
            </div>
          </div>

          <button onClick={handleAddExhibition} className="add-btn">
            Add Exhibition
          </button>
        </div>
      </div>

      {/* Exhibitions List */}
      <div className="editor-section">
        <h3>Exhibitions ({content.exhibitions.length})</h3>
        <div className="exhibitions-list">
          {content.exhibitions.map((exhibition, index) => (
            <div key={exhibition.id} className="exhibition-row">
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
                  disabled={index === content.exhibitions.length - 1}
                  className="order-btn"
                >
                  ↓
                </button>
              </div>

              <div className="exhibition-info">
                {editingExhibition?.id === exhibition.id ? (
                  <div className="edit-form">
                    <div className="form-row">
                      <input
                        type="text"
                        value={editingExhibition.title}
                        onChange={(e) =>
                          setEditingExhibition({
                            ...editingExhibition,
                            title: e.target.value,
                          })
                        }
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editingExhibition.year}
                        onChange={(e) =>
                          setEditingExhibition({
                            ...editingExhibition,
                            year: e.target.value,
                          })
                        }
                        placeholder="Year"
                        className="small-input"
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        value={editingExhibition.venue}
                        onChange={(e) =>
                          setEditingExhibition({
                            ...editingExhibition,
                            venue: e.target.value,
                          })
                        }
                        placeholder="Venue"
                      />
                      <input
                        type="text"
                        value={editingExhibition.location}
                        onChange={(e) =>
                          setEditingExhibition({
                            ...editingExhibition,
                            location: e.target.value,
                          })
                        }
                        placeholder="Location"
                      />
                    </div>
                    <textarea
                      value={editingExhibition.description}
                      onChange={(e) =>
                        setEditingExhibition({
                          ...editingExhibition,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description"
                      rows={3}
                    />

                    <div className="edit-images">
                      <label>Images</label>
                      <div className="images-grid">
                        {editingExhibition.images.map((img, imgIndex) => (
                          <div key={imgIndex} className="image-preview-small">
                            <img src={img} alt={`Image ${imgIndex + 1}`} />
                            <button
                              onClick={() => handleEditImageUpload('', imgIndex)}
                              className="remove-image-btn"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <div className="add-image-zone small">
                          <ImageUpload
                            key={editingExhibition.images.length}
                            onUpload={handleAddEditImage}
                            label=""
                          />
                        </div>
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button onClick={handleUpdateExhibition} className="save-btn">
                        Save
                      </button>
                      <button
                        onClick={() => setEditingExhibition(null)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4>{exhibition.title}</h4>
                    <p className="exhibition-meta">
                      {exhibition.year} · {exhibition.venue}, {exhibition.location}
                    </p>
                    <p className="exhibition-desc">{exhibition.description}</p>
                    {exhibition.images.length > 0 && (
                      <div className="exhibition-thumbs">
                        {exhibition.images.slice(0, 3).map((img, i) => (
                          <img key={i} src={img} alt={`Thumb ${i + 1}`} />
                        ))}
                        {exhibition.images.length > 3 && (
                          <span className="more-images">
                            +{exhibition.images.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {editingExhibition?.id !== exhibition.id && (
                <div className="item-actions">
                  <button
                    onClick={() => setEditingExhibition({ ...exhibition })}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveExhibition(exhibition.id)}
                    className="delete-btn"
                  >
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

export default ExhibitionsEditor;
