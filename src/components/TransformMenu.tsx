import { useEffect, useState } from 'react';
import './style/TransformMenu.css';
import { getSelectedObjPosition, getSelectedObjRotation, getSelectedObjScale, onSceneListRemove, onSelectUpdate, updateSelectedObjTransform } from '../renderer';

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

export default function TransformMenu() {
    const [position, setPosition] = useState<Position>({x: 0, y: 0, z: 0});
    const [rotation, setRotation] = useState<Rotation>({x: 0, y: 0, z: 0});
    const [scale, setScale] = useState<Scale>({x: 1, y: 1, z: 1});
    const [selected, setSelected] = useState<boolean>(false);

    useEffect(() => {
        const onSelectUpdateUnsub = onSelectUpdate.subscribe(onNewObjectSelected)
        const onSceneListRemoveUnsub = onSceneListRemove.subscribe(onObjectDeleted) 

        return () => {
            onSelectUpdateUnsub();
            onSceneListRemoveUnsub();
        }
    }, []);
  
    useEffect(() => { // Updating transforms info whenever any of it changes.
        updateSelectedObjTransform(position, rotation, scale);
    }, [position, rotation, scale]);

    function onObjectDeleted(){
        setSelected(false);
        setPosition({x: 0, y: 0, z: 0});
        setRotation({x: 0, y: 0, z: 0});
        setScale({x: 1, y: 1, z: 1});

    }
    function onNewObjectSelected() {
        setSelected(true);
        setPosition(getSelectedObjPosition());
        setRotation(getSelectedObjRotation());
        setScale(getSelectedObjScale());
    }

    return (
        <div className={`transform-controls ${selected === false ? 'disabled' : ''}`}>
            <div className="transform-group">
                <label>Position:</label>
                <div className="axis-group">
                <span>x:</span><input type="number" value={position.x}
                onChange={(e) => setPosition({ ...position, x: parseFloat(e.target.value) || 0 })}/>
                <span>y:</span><input type="number" value={position.y}
                onChange={(e) => setPosition({ ...position, y: parseFloat(e.target.value) || 0 })}/>
                <span>z:</span><input type="number" value={position.z}
                onChange={(e) => setPosition({ ...position, z: parseFloat(e.target.value) || 0 })}/>
                </div>
            </div>
            <div className="transform-group">
                <label>Rotation:</label>
                <div className="axis-group">
                <span>x:</span><input type="number" value={rotation.x}
                onChange={(e) => setRotation({ ...rotation, x: parseFloat(e.target.value) || 0 })}/>
                <span>y:</span><input type="number" value={rotation.y}
                onChange={(e) => setRotation({ ...rotation, y: parseFloat(e.target.value) || 0 })}/>
                <span>z:</span><input type="number" value={rotation.z}
                onChange={(e) => setRotation({ ...rotation, z: parseFloat(e.target.value) || 0 })}/>
                </div>
            </div>
            <div className="transform-group">
                <label>Scale:</label>
                <div className="axis-group">
                <span>x:</span><input type="number" value={scale.x}
                onChange={(e) => setScale({ ...scale, x: parseFloat(e.target.value) || 0 })}/>
                <span>y:</span><input type="number" value={scale.y}
                onChange={(e) => setScale({ ...scale, y: parseFloat(e.target.value) || 0 })}/>
                <span>z:</span><input type="number" value={scale.z}
                onChange={(e) => setScale({ ...scale, z: parseFloat(e.target.value) || 0 })}/>
                </div>
            </div>
        </div>
    );
}
