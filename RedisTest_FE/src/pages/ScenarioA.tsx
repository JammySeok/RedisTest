import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ScenarioA() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<any>(null); // { rank, isAllowed, message }
  const [polling, setPolling] = useState(false);
  const navigate = useNavigate();

  // [테스트용] 더미 데이터 50개 생성 함수
  const handleAddDummies = async () => {
    try {
      const promises = [];
      const timestamp = Date.now();
      
      // 50명의 가짜 유저를 동시에 등록 요청
      for (let i = 0; i < 50; i++) {
        promises.push(
          fetch(`http://localhost:8080/scenario-a/enter?name=dummy_${timestamp}_${i}`, {
            method: 'POST',
          })
        );
      }
      await Promise.all(promises);
      alert('가짜 대기자 50명이 등록되었습니다! 이제 본인을 등록해보세요.');
    } catch (err) {
      console.error(err);
      alert('더미 생성 실패');
    }
  };

  // 대기열 입장 (POST)
  const handleEnter = async () => {
    if (!name) return alert('이름을 입력해주세요');
    try {
      await fetch(`http://localhost:8080/scenario-a/enter?name=${name}`, {
        method: 'POST',
      });
      setPolling(true); // 폴링 시작
    } catch (err) {
      console.error(err);
      alert('입장 요청 실패');
    }
  };

  // 상태 조회 (GET) - 폴링 로직
  useEffect(() => {
    let intervalId: number;

    if (polling && name) {
      fetchStatus(); // 즉시 1회 실행
      intervalId = setInterval(fetchStatus, 1000); // 변화를 잘 보기 위해 1초마다 갱신
    }

    return () => clearInterval(intervalId);
  }, [polling, name]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`http://localhost:8080/scenario-a/status?name=${name}`);
      const data = await res.json();
      setStatus(data);

      if (data.isAllowed) {
        setPolling(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pass = () => {
    navigate('/');
  };

  return (
    <div>
      <h2>로직 B: 대기열 시스템 테스트</h2>
      
      {/* 테스트 헬퍼 섹션 */}
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h4>🛠 테스트 도구</h4>
        <p>혼자 테스트할 때 대기열이 너무 빨리 빠진다면?</p>
        <button onClick={handleAddDummies} style={{ backgroundColor: '#666', color: 'white' }}>
          🤖 가짜 대기자 50명 먼저 넣기
        </button>
      </div>

      <hr />

      {/* 실제 사용자 입력 섹션 */}
      {!polling && !status && (
        <div style={{ marginTop: '20px' }}>
          <h3>서비스 입장 신청</h3>
          <input 
            type="text" 
            placeholder="내 닉네임 입력" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <button onClick={handleEnter} style={{ marginLeft: '10px' }}>줄 서기</button>
        </div>
      )}

      {/* 상태 표시 섹션 */}
      {status && (
        <div style={{ marginTop: '20px', border: '2px solid #007bff', padding: '20px', borderRadius: '10px' }}>
          <h3>상태: {status.message}</h3>
          
          {status.isAllowed ? (
            <div style={{ color: 'green', fontWeight: 'bold' }}>
              <p style={{ fontSize: '20px' }}>🎉 드디어 입장이 허용되었습니다!</p>
              <button onClick={pass} style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px' }}>
                서비스 입장하기 🚀
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
                현재 대기 순번: {status.rank}번
              </p>
              <p>뒤에 있는 스케줄러가 1초에 2명씩 입장시키고 있습니다...</p>
              <div style={{ width: '100%', backgroundColor: '#eee', height: '20px', borderRadius: '10px' }}>
                 <div style={{ width: '50%', backgroundColor: '#007bff', height: '100%', borderRadius: '10px', animation: 'pulse 1s infinite' }}></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}