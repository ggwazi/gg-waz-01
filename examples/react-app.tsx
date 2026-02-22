import React, { useState } from 'react';

interface ReactAppProps {
  title?: string;
}

export const ReactApp: React.FC<ReactAppProps> = ({ title = 'AlmostNode React Demo' }) => {
  const [count, setCount] = useState(0);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleExecute = () => {
    try {
      const result = eval(input);
      setOutput(`Result: ${JSON.stringify(result)}`);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>{title}</h1>

      <section style={{ marginBottom: '20px' }}>
        <h2>Counter Demo</h2>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </section>

      <section>
        <h2>Code Evaluator</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter JavaScript code"
          style={{
            width: '100%',
            height: '100px',
            padding: '10px',
            fontFamily: 'monospace',
          }}
        />
        <button onClick={handleExecute}>Execute</button>
        {output && <pre style={{ background: '#f5f5f5', padding: '10px' }}>{output}</pre>}
      </section>
    </div>
  );
};

export default ReactApp;
