// src/components/LogDisplay.tsx
import React, { useEffect, useRef } from 'react';
import Button from './smartButton'; // Button 컴포넌트 임포트

interface LogDisplayProps {
  logs: { level: string; timestamp: string; message: string; details?: any }[]; // 로그 형식 정의
  clearLogs: () => void; // 로그 삭제 함수
}

const LogDisplay: React.FC<LogDisplayProps> = ({ logs, clearLogs }) => {
  // 로그 컨테이너의 참조를 사용하여 스크롤을 조작
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // 로그가 변경될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]); // logs가 업데이트될 때마다 실행

  return (
    <div style={{ marginTop: '20px' }}>
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
          maxHeight: '300px',
          overflowY: 'auto',
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
                color:
                  log.level === 'error'
                    ? '#dc3545'
                    : log.level === 'success'
                      ? '#28a745'
                      : log.level === 'warning'
                        ? '#ffc107'
                        : '#212529',
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
