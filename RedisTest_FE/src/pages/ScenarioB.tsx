import { useState, useEffect } from 'react';

interface UserStatus {
  name: string;
  rank: number;
  isAllowed: boolean;
  message: string;
}

export default function ScenarioB() {
  const [inputName, setInputName] = useState('');
  const [users, setUsers] = useState<string[]>([]); // 관리 중인 유저 이름 목록
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>({}); // 유저별 상태 정보

  // 1. 유저 추가 및 대기열 등록 (Enter)
  const handleAddUser = async () => {
    if (!inputName.trim()) return alert('유저 이름을 입력하세요.');
    if (users.includes(inputName)) return alert('이미 대시보드에 존재하는 이름입니다.');

    try {
      // 서버에 대기열 진입 요청
      await fetch(`http://localhost:8080/scenario-b/enter?name=${inputName}`, {
        method: 'POST',
      });

      // 관리 목록에 추가
      setUsers((prev) => [...prev, inputName]);
      setInputName('');
    } catch (err) {
      console.error(err);
      alert('대기열 진입 요청 실패');
    }
  };

  // 2. 유저 퇴장 시키기 (Exit)
  const handleExit = async (username: string) => {
    try {
      await fetch(`http://localhost:8080/scenario-b/exit?name=${username}`, {
        method: 'POST',
      });
      // 퇴장 후 리스트에서 바로 지우지 않고 상태 변화를 보여줍니다. (필요하면 삭제 버튼으로 제거)
    } catch (err) {
      console.error(err);
      alert('퇴장 요청 실패');
    }
  };

  // 3. 리스트에서 제거 (화면에서만 삭제)
  const handleRemoveFromList = (username: string) => {
    setUsers((prev) => prev.filter((u) => u !== username));
    setStatuses((prev) => {
      const next = { ...prev };
      delete next[username];
      return next;
    });
  };

  // 4. 모든 유저 상태 주기적 조회 (Polling)
  useEffect(() => {
    const fetchAllStatuses = async () => {
      if (users.length === 0) return;

      const nextStatuses: Record<string, UserStatus> = {};

      // 등록된 모든 유저의 상태를 병렬로 조회
      await Promise.all(
        users.map(async (name) => {
          try {
            const res = await fetch(`http://localhost:8080/scenario-b/status?name=${name}`);
            const data = await res.json(); // { rank, isAllowed, message }
            nextStatuses[name] = { name, ...data };
          } catch (e) {
            console.error(e);
          }
        })
      );

      setStatuses(nextStatuses);
    };

    // 1초마다 갱신
    const interval = setInterval(fetchAllStatuses, 1000);
    // 즉시 실행
    fetchAllStatuses();

    return () => clearInterval(interval);
  }, [users]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>시나리오 B: 대기열 관리 대시보드</h2>
      <p>여러 유저를 등록하여 <strong>수용량(3명) 제한</strong>에 따른 대기열 작동을 확인하세요.</p>

      {/* 유저 등록 컨트롤러 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="유저 이름 (예: User1)"
          onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
        />
        <button 
          onClick={handleAddUser}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          + 대기열 등록
        </button>
      </div>

      {/* 유저 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            등록된 유저가 없습니다. 위에서 유저를 추가해보세요!
          </div>
        ) : (
          users.map((name) => {
            const status = statuses[name];
            const isAllowed = status?.isAllowed;
            const rank = status?.rank;
            const isWaiting = rank && rank > 0;
            const isExited = rank === -1 && !isAllowed; // 대기열에도 없고 입장도 안 한 상태

            return (
              <div 
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: isAllowed ? '#e6fffa' : (isWaiting ? '#fffbe6' : '#f1f3f5'),
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {/* 이름 및 상태 텍스트 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{name}</span>
                  
                  {isAllowed && (
                    <span style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      입장 완료 (Active)
                    </span>
                  )}
                  {isWaiting && (
                    <span style={{ backgroundColor: '#ffc107', color: 'black', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      대기 {rank}번
                    </span>
                  )}
                  {isExited && (
                     <span style={{ backgroundColor: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      종료됨
                    </span>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {isAllowed && (
                    <button 
                      onClick={() => handleExit(name)}
                      style={{ 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                    >
                      퇴장 (Exit)
                    </button>
                  )}
                  
                  {/* 리스트에서 제거 버튼 (옵션) */}
                  <button 
                    onClick={() => handleRemoveFromList(name)}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#999', 
                      border: '1px solid #ddd', 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                    title="목록에서 제거"
                  >
                    X
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}