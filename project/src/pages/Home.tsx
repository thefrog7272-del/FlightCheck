import { useState } from 'react';
import { PlaneCard } from '../components/PlaneCard';
import styles from './Home.module.css';
import { Search, Plus, RotateCcw } from 'lucide-react';
import { useFleet } from '../hooks/useFleet';
import { parsePlaneCsv } from '../utils/csvParser';

export function Home() {
  const { planes, addPlane, resetFleet, deletePlane, customPlaneIds } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filteredPlanes = planes.filter(plane => 
    plane.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plane.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImport = () => {
    try {
      const { plane, checklist } = parsePlaneCsv(csvInput);
      
      // Override image if a file was uploaded
      if (imagePreview) {
        plane.image = imagePreview;
      }
      
      addPlane(plane, checklist);
      setIsModalOpen(false);
      setCsvInput('');
      setImagePreview(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  };

  const sampleCsv = `name,manufacturer,type,image,phase,item,expectedState
"Piper Archer II","Piper","GA","https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=1200","Pre-Flight","Master Switch","ON"
"Piper Archer II","Piper","GA","https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=80&w=1200","Pre-Flight","Fuel Pump","ON"`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Select a Plane</h1>
          <div className={styles.actions}>
            <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Plane
            </button>
            <button className={styles.resetButton} onClick={resetFleet}>
              <RotateCcw size={18} /> Reset
            </button>
          </div>
        </div>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by model or manufacturer..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredPlanes.length > 0 ? (
        <div className={styles.grid}>
          {filteredPlanes.map(plane => (
            <PlaneCard 
              key={plane.id} 
              plane={plane} 
              onDelete={deletePlane}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <p>No planes found matching "{searchQuery}"</p>
          <button 
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Import Plane & Checklist</h2>
            
            <div className={styles.fileInputWrapper}>
              <label className={styles.csvLabel}>Aircraft Image (Optional):</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </div>

            <label className={styles.csvLabel}>Paste CSV Content:</label>
            <textarea
              className={styles.textarea}
              placeholder={sampleCsv}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton} 
                onClick={() => {
                  setIsModalOpen(false);
                  setImagePreview(null);
                }}
              >
                Cancel
              </button>
              <button className={styles.submitButton} onClick={handleImport}>
                Import Fleet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
