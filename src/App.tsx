import { useCallback} from 'react';
import type { ChangeEvent } from 'react';
import './App.css';
import { mount, updateSceneWithURL} from './renderer.ts';
import MeshList from './components/MeshList.tsx';


export default function App() {
  const containerRef = useCallback(mount, []);

  return (
    <>
      <div className="app-container">
        <div className="cube" ref={containerRef}>
          <canvas id="myCanvas" />
        </div>
        <div className="sidebar">
          <MeshList></MeshList>
        </div>
      </div>
    </>
  )
}