import React, { useEffect, useRef } from 'react';
import Button from './smartButton'; // Button 컴포넌트 임포트

interface LogDisplayProps {
  logs: { timestamp: string; message: string; details?: any }[]; // 로그 형식 정의
  clearLogs: () => void; // 로그 삭제 함수
}

const LogDisplay: React.FC<LogDisplayProps> = ({ logs, clearLogs }) => {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // 로그가 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      style={{
        marginLeft: '10px',
        marginRight: '10px',
        paddingBottom: '30px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // 부모 요소에서 크기를 받도록 설정
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4>실행 로그</h4>
        {/* 로그 삭제 버튼 */}
        <Button
          onClick={clearLogs}
          style={{ backgroundColor: '#e74c3c', color: '#fff' }}
        >
          로그 삭제
        </Button>
      </div>
      <div
        ref={logContainerRef}
        style={{
          flex: 1, // 부모의 크기를 모두 차지하게 설정
          overflowY: 'auto', // 내용이 넘치면 스크롤
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center' }}>
            로그가 없습니다.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: '5px',
                color: log.message.includes('경고')
                  ? '#ffc107' // 경고는 노란색
                  : log.message.includes('실패')
                    ? '#dc3545' // 실패는 빨간색
                    : '#28a745', // 성공은 초록색
              }}
            >
              <span style={{ color: '#6c757d' }}>
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>{' '}
              {log.message}
              {log.details && (
                <pre
                  style={{
                    marginTop: '5px',
                    marginBottom: '5px',
                    padding: '5px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogDisplay;
