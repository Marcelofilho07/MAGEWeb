import React, { useCallback, useState, type ChangeEvent } from 'react';
import './MeshList.css';
import { getPosition, getRotation, getScale, removeFromSceneWithID, updateSceneWithURL } from '../renderer';

type listEntry = {
    id: number;
    name: string;
}

interface Position {
    x: number;
    y: number;
    z: number;
}

interface Rotation {
    x: number;
    y: number;
    z: number;
}

interface Scale {
    x: number;
    y: number;
    z: number;
}

export default function MeshList() {
    const [selected, setSelected] = useState<number>(0);
    const [meshList, setList] = useState<listEntry[]>([]); //we can do better than this right? lol
    const [position, setPosition] = useState<Position>({x: 0, y: 0, z: 0});
    const [rotation, setRotation] = useState<Rotation>({x: 0, y: 0, z: 0});
    const [scale, setScale] = useState<Scale>({x: 1, y: 1, z: 1});
  
    async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        const {id , name} = await updateSceneWithURL(URL.createObjectURL(file));
        setList(prev => [...prev, {id, name}]);
        console.log(id);
        console.log(name);

        setPosition(getPosition(id));
        setRotation(getRotation(id));
        setScale(getScale(id));
    };

    function handleRemove() {
        console.log(selected);
        if(selected != 0) {
            if(removeFromSceneWithID(selected)) {
                setList((prev) => prev.filter(entry => entry.id !== selected));
                setSelected(0);
            }
        }
    };

    function handleSelect(id: number) {
        setPosition(getPosition(id));
        setRotation(getRotation(id));
        setScale(getScale(id));
        console.log(position);
        setSelected(id);
    }

    return (
        <div className="mesh-list">
        <div className="mesh-list-header">
            <span>Objects</span>
            <div className="mesh-list-buttons">
            <label className="upload-label">
                +
                <input type="file" accept=".glb,.gltf" onChange={handleUpload} hidden/>
            </label>
            <button onClick={handleRemove}>-</button>
            </div>
        </div>
        <div>
            <ul className="mesh-list-items">
                {meshList.map((entry) => (
                <li
                    key={entry.id}
                    className={`mesh-list-item ${selected === entry.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(entry.id)}
                >
                    {entry.name}
                </li>
                ))}
            </ul>
        </div>
        <div className={`transform-controls ${selected === 0 ? 'disabled' : ''}`}>
            <div className="transform-group">
                <label>Position:</label>
                <div className="axis-group">
                <span>x:</span><input type="number" disabled={selected === 0} value={position.x}
                onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) || 0 })}/>
                <span>y:</span><input type="number" disabled={selected === 0} defaultValue={position.y}
                onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) || 0 })}/>
                <span>z:</span><input type="number" disabled={selected === 0} defaultValue={position.z}
                onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) || 0 })}/>
                </div>
            </div>
            <div className="transform-group">
                <label>Rotation:</label>
                <div className="axis-group">
                <span>x:</span><input type="number" disabled={selected === 0} defaultValue={rotation.x}/>
                <span>y:</span><input type="number" disabled={selected === 0} defaultValue={rotation.y}/>
                <span>z:</span><input type="number" disabled={selected === 0} defaultValue={rotation.z}/>
                </div>
            </div>
            <div className="transform-group">
                <label>Scale:</label>
                <div className="axis-group">
                <span>x:</span><input type="number" disabled={selected === 0} defaultValue={scale.x}/>
                <span>y:</span><input type="number" disabled={selected === 0} defaultValue={scale.y}/>
                <span>z:</span><input type="number" disabled={selected === 0} defaultValue={scale.z}/>
                </div>
            </div>
        </div>
    </div>
    
    );
}
