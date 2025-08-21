import './style/Buttons.css';
import { addCapsule, addCone, addCube, addCylinder, addPlane} from '../renderer.ts';


export default function AddPrimitiveButtons() {
  function handleAddCube() {
    addCube();
  };

  function handleAddPlane() {
    addPlane();  
  };

  function handleAddCapsule() {
    addCapsule();
  };

  function handleAddCone() {
    addCone();   
  };

  function handleAddCylinder() {    
    addCylinder();
  };

  return (
    <>        
        <button onClick={handleAddCube}>Add Cube</button>
        <button onClick={handleAddPlane}>Add Plane</button>
        <button onClick={handleAddCapsule}>Add Capsule</button>
        <button onClick={handleAddCone}>Add Cone</button>
        <button onClick={handleAddCylinder}>Add Cylinder</button>
    </>
  )
}