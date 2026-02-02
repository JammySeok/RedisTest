import { useState, useEffect } from 'react';

export default function ScenarioB() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<any>(null); 
  const [polling, setPolling] = useState(false);
  
  // 퇴장시킬 유저 이름 (테스트용)
  const [exitTarget, setExitTarget] = useState('');

  // 1. 대기열 등록 (더미 50명 넣고 나도 넣기)
  const handleRegister = async () => {
    // 먼저 꽉 채우기 위해 더미 10명 넣기
    for(let i=0; i<10; i++) {
        await fetch(`http://localhost:8080/scenario-b/enter?name=dummy_${i}`, { method: 'POST' });
    }
    // 내 캐릭터 등록
    await fetch(`http://localhost:8080/scenario-b/enter?name=${name}`, { method: 'POST' });
    setPolling(true);
  };

  // 2. 내 상태 확인 (폴링)
  useEffect(() => {
    let interval: number;
    if (polling) {
      interval = setInterval(async () => {
        const res = await fetch(`http://localhost:8080/scenario-b/status?name=${name}`);
        const data = await res.json();
        setStatus(data);
        if (data.isAllowed) setPolling(false);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [polling, name]);

  // 3. 누군가 퇴장 시키기 (빈자리 만들기)
  const handleForceExit = async () => {
    if(!exitTarget) return alert('퇴장시킬 유저 이름을 입력하세요 (예: dummy_0)');
    
    await fetch(`http://localhost:8080/scenario-c/exit?name=${exitTarget}`, { method: 'POST' });
    alert(`${exitTarget} 퇴장 완료! 빈자리가 생겨서 대기열이 줄어들 겁니다.`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>시나리오 C: 수용량 제한 (Capacity Limit)</h2>
      <p>정원(5명)이 꽉 차면, 누군가 <strong>퇴장(Exit)</strong>해야 대기열이 줄어듭니다.</p>

      <hr />
      
      {/* 본인 입장 영역 */}
      <div>
        <h3>1. 입장 신청</h3>
        {!polling && !status?.isAllowed ? (
          <>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="내 닉네임" />
            <button onClick={handleRegister}>더미 10명과 함께 줄서기</button>
          </>
        ) : (
           <h3>{status?.isAllowed ? "🎉 서비스 이용 중 (입장 성공)" : `현재 대기 순번: ${status?.rank}번`}</h3>
        )}
      </div>

      <hr />

      {/* 퇴장 시뮬레이션 영역 */}
      <div style={{ backgroundColor: '#ffecec', padding: '15px', borderRadius: '8px' }}>
        <h3>2. 퇴장 시뮬레이터 (자리를 비워주세요)</h3>
        <p>대기 순번이 줄어들지 않나요? 기존 입장자를 강제로 퇴장시켜보세요.</p>
        <p>더미 이름: <code>dummy_0</code>, <code>dummy_1</code> ...</p>
        
        <input 
          value={exitTarget} 
          onChange={e => setExitTarget(e.target.value)} 
          placeholder="퇴장시킬 이름 (예: dummy_0)" 
        />
        <button onClick={handleForceExit}>강제 퇴장시키기</button>
      </div>
      
      {status?.isAllowed && (
          <div style={{marginTop: '20px'}}>
            <button onClick={() => { setExitTarget(name); handleForceExit(); }}>
                나 스스로 작업 종료하고 나가기 (Exit)
            </button>
          </div>
      )}
    </div>
  );
}