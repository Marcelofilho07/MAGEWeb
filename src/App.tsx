import { useCallback} from 'react';
import './App.css';
import { mount} from './renderer.ts';
import MeshList from './components/MeshList.tsx';
import TransformMenu from './components/TransformMenu.tsx';
import UploadButton from './components/UploadButton.tsx';
import AddPrimitiveButtons from './components/AddPrimitivesButtons.tsx';


export default function App() {
  const containerRef = useCallback(mount, []);

  return (
    <>
      <div className="app-container">
        <div className="canvas" ref={containerRef}>
          <canvas id="myCanvas" />
        </div>
        <div className="sidebar">
          <AddPrimitiveButtons/>
          <UploadButton/>
          <MeshList/>
          <TransformMenu/>
        </div>
      </div>
    </>
  )
}