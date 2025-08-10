import { useCallback, useState } from 'react'
import './App.css'
import { mount, updateCube } from './main.tsx';


export default function App() {
  const [inputValue, setInputValue] = useState('');
  const containerRef = useCallback(mount, []);
  const handleClick = () => {
    updateCube(+inputValue);
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      <h1>Cube?</h1>
      <div className="cube" ref={containerRef}></div>
      <div className="card">
        <button onClick={() => handleClick()}>
          Set Sphere pos X
        </button>
        <div>
          <label htmlFor="my-text-input">Enter cube Pos X:</label>
          <input
            type="text"
            id="my-text-input"
            value={inputValue}
            onChange={handleChange}
          />
          <p>You typed: {inputValue}</p>
        </div>
      </div>
    </>
  )
}