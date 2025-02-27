// src/renderer/context/MessageContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from 'react';

interface MessageContextType {
  message: string;
  messageType: 'success' | 'info' | 'warning' | 'error';
  // 두 번째와 세 번째 인수를 선택적으로
  showMessage: (
    message: string,
    type?: 'success' | 'info' | 'warning' | 'error',
    timeout?: number
  ) => void;
  hideMessage: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('info');
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 메시지 표시 함수
  const showMessage = (
    newMessage: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    timeout: number = 5000
  ) => {
    setMessage(newMessage);
    setMessageType(type);

    // 이전 타이머가 있으면 제거
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    // 새 타이머 설정 (timeout이 0이면 자동으로 사라지지 않음)
    if (timeout > 0) {
      messageTimerRef.current = setTimeout(() => {
        setMessage('');
      }, timeout);
    }
  };

  // 메시지 숨기기 함수
  const hideMessage = () => {
    setMessage('');
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  return (
    <MessageContext.Provider
      value={{ message, messageType, showMessage, hideMessage }}
    >
      {children}
    </MessageContext.Provider>
  );
}

// 컨텍스트 사용 훅
export function useMessage() {
  const context = useContext(MessageContext);

  if (context === undefined) {
    throw new Error('useMessage는 MessageProvider 내부에서 사용해야 합니다');
  }

  return context;
}
