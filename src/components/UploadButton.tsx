import { useRef, type ChangeEvent } from 'react';
import './UploadButton.css';
import { updateSceneWithURL} from '../renderer.ts';


export default function UploadButton() {
  const file = useRef<File | undefined>(undefined);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    file.current = event.target.files?.[0];
  };

  function handleAddToScene() {
    if (!file.current) return;
    updateSceneWithURL(URL.createObjectURL(file.current));    
  };

  return (
    <>
        <label className="upload-label">
            Upload Model
            <input type="file" accept=".glb,.gltf" onChange={handleUpload} />
        </label>
        
        <button onClick={handleAddToScene}>Add Model</button>
    </>
  )
}