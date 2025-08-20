import { useCallback} from 'react';
import type { ChangeEvent } from 'react';
import './UploadButton.css';
import { mount, updateSceneWithURL} from '../renderer.ts';


export default function UploadButton() {
  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    updateSceneWithURL(URL.createObjectURL(file));    
  };

  return (
    <>
        <label className="upload-label">
            Upload Model
            <input type="file" accept=".glb,.gltf" onChange={handleUpload} />
        </label>
    </>
  )
}