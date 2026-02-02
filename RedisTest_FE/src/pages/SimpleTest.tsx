import { useState } from 'react';

export default function SimpleTest() {
  const [name, setName] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:8080/simple/add?name=${name}`, {
        method: 'POST',
      });
      const text = await res.text();
      setResult(text);
    } catch (err) {
      setResult('에러 발생');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>로직 A: 기존 단순 작업열</h2>
      <p>작업을 등록하면 백엔드 스케줄러가 5초 뒤에 처리합니다.</p>
      
      <input 
        type="text" 
        placeholder="사용자명 입력" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <button onClick={handleSubmit}>작업 등록</button>
      
      {result && <div style={{ marginTop: '10px', color: 'blue' }}>결과: {result}</div>}
    </div>
  );
}