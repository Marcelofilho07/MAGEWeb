import React, { useEffect, useState } from 'react';
import './style/MeshList.css';
import {getSelectedObj, onMeshListUpdate,  onSelectUpdate,  removeFromSceneWithID, setObjByID } from '../renderer';

type listEntry = {
    id: number;
    name: string;
}

export default function MeshList() {
    const [selected, setSelected] = useState<number>(0);
    const [meshList, setList] = useState<listEntry[]>([]); //we can do better than this right? lol
  
    useEffect(() => {
        const onMeshListUpdateUnsub = onMeshListUpdate.subscribe(handleNewSceneItem)
        const onSelectUpdateUnsub = onSelectUpdate.subscribe(onNewSelect);

        return () => {
            onMeshListUpdateUnsub();
            onSelectUpdateUnsub();
        }
    }, []);

    function handleNewSceneItem(value: { id: number , name: string}) {
        setList(prev => [...prev, value]);
    }

    function handleRemove() {
        if(selected != 0) {
            if(removeFromSceneWithID(selected)) {
                setList((prev) => prev.filter(entry => entry.id !== selected));
                setSelected(0);
            }
        }
    };

    function handleSelect(id: number) {
        if(id != 0) {
            setObjByID(id);
        }
        setSelected(id);
    }

    function onNewSelect(){
        const newId = getSelectedObj()?.id;
        if (newId) {
            setSelected(newId);
        }
    }

    return (
        <div className="mesh-list">
        <div className="mesh-list-header">
            <span>Objects</span>
            <div className="mesh-list-buttons">
                <button onClick={handleRemove}>Delete</button>
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
    </div>
    
    );
}
