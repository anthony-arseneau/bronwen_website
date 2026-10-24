import { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { createCategoryId, slugify } from '../../data/galleryCategories';

function GallerySectionsEditor({ onChange }) {
  const { content, updateGalleryCategories, removeGalleryCategory } = useContent();
  const { categories, items } = content.gallery;
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [newSubsectionLabels, setNewSubsectionLabels] = useState({});

  // parentId is null for top-level sections.
  const updateList = (parentId, list) => {
    if (!parentId) {
      updateGalleryCategories(list);
      return;
    }
    updateGalleryCategories(categories.map((category) =>
      category.id === parentId ? { ...category, children: list } : category
    ));
  };

  const countItems = (section) => {
    const ids = [section.id, ...(section.children || []).map((child) => child.id)];
    return items.filter((item) => ids.includes(item.category)).length;
  };

  const hasDuplicateName = (list, section) => list.some((other) =>
    other.id !== section.id && slugify(other.label) === slugify(section.label)
  );

  const handleRename = (parentId, list, index, label) => {
    updateList(parentId, list.map((section, i) => (i === index ? { ...section, label } : section)));
  };

  const handleRenameBlur = (parentId, list, index) => {
    const label = list[index].label.trim();
    if (label !== list[index].label || !label) {
      handleRename(parentId, list, index, label || 'Untitled section');
    }
  };

  const handleMove = (parentId, list, index, offset) => {
    const next = [...list];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    updateList(parentId, next);
  };

  const handleAdd = (parentId, label) => {
    const trimmed = label.trim();
    if (!trimmed) return false;
    const list = parentId
      ? categories.find((category) => category.id === parentId).children
      : categories;
    if (list.some((section) => slugify(section.label) === slugify(trimmed))) {
      alert(`There is already a section called "${trimmed}" here.`);
      return false;
    }
    const section = { id: createCategoryId(trimmed), label: trimmed };
    updateList(parentId, [...list, parentId ? section : { ...section, children: [] }]);
    onChange();
    return true;
  };

  const handleDelete = (section, parent) => {
    const count = countItems(section);
    const destination = parent ? `"${parent.label}"` : 'Uncategorized';
    const message = count > 0
      ? `Delete "${section.label}"? Its ${count} artwork${count === 1 ? '' : 's'} will move to ${destination}.`
      : `Delete "${section.label}"?`;
    if (confirm(message)) {
      removeGalleryCategory(section.id);
      onChange();
    }
  };

  const renderRow = (section, list, index, parent) => {
    const parentId = parent?.id || null;
    const count = countItems(section);
    return (
      <div className={`section-row ${parent ? 'subsection-row' : ''}`}>
        <div className="section-order">
          <button
            onClick={() => handleMove(parentId, list, index, -1)}
            disabled={index === 0}
            className="order-btn"
            aria-label={`Move ${section.label} up`}
          >
            ↑
          </button>
          <button
            onClick={() => handleMove(parentId, list, index, 1)}
            disabled={index === list.length - 1}
            className="order-btn"
            aria-label={`Move ${section.label} down`}
          >
            ↓
          </button>
        </div>
        <div className="section-name">
          <input
            type="text"
            value={section.label}
            onChange={(e) => handleRename(parentId, list, index, e.target.value)}
            onBlur={() => handleRenameBlur(parentId, list, index)}
            aria-label={parent ? `Subsection of ${parent.label}` : 'Section name'}
          />
          {hasDuplicateName(list, section) && (
            <span className="section-warning">Another section here has the same name; rename one of them.</span>
          )}
        </div>
        <span className="section-count">{count} artwork{count === 1 ? '' : 's'}</span>
        <button onClick={() => handleDelete(section, parent)} className="delete-btn">
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="editor-section">
      <h3>Gallery Sections</h3>
      <p className="section-hint">
        These appear under Gallery in the site menu, in this order. Renaming a section keeps its
        artwork. Deleting a subsection moves its artwork up to the main section; deleting a main
        section makes its artwork Uncategorized (it still shows under All work).
      </p>

      <div className="sections-list">
        {categories.map((section, index) => (
          <div key={section.id} className="section-card">
            {renderRow(section, categories, index, null)}
            <div className="subsection-list">
              {section.children.map((child, childIndex) => (
                <div key={child.id}>{renderRow(child, section.children, childIndex, section)}</div>
              ))}
              <div className="section-add-row subsection-add-row">
                <input
                  type="text"
                  value={newSubsectionLabels[section.id] || ''}
                  onChange={(e) => setNewSubsectionLabels({ ...newSubsectionLabels, [section.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && handleAdd(section.id, newSubsectionLabels[section.id] || '')) {
                      setNewSubsectionLabels({ ...newSubsectionLabels, [section.id]: '' });
                    }
                  }}
                  placeholder={`New subsection under ${section.label}`}
                />
                <button
                  onClick={() => {
                    if (handleAdd(section.id, newSubsectionLabels[section.id] || '')) {
                      setNewSubsectionLabels({ ...newSubsectionLabels, [section.id]: '' });
                    }
                  }}
                  className="edit-btn"
                >
                  Add subsection
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-add-row">
        <input
          type="text"
          value={newSectionLabel}
          onChange={(e) => setNewSectionLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && handleAdd(null, newSectionLabel)) setNewSectionLabel('');
          }}
          placeholder="New main section (e.g. Drawing)"
        />
        <button
          onClick={() => {
            if (handleAdd(null, newSectionLabel)) setNewSectionLabel('');
          }}
          className="add-btn"
        >
          Add section
        </button>
      </div>
    </div>
  );
}

export default GallerySectionsEditor;
