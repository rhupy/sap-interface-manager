// src/renderer/components/MessageDisplay.tsx
import React from 'react';
import styled from 'styled-components';
import { useMessage } from '../context/MessageContext';

const MessageContainer = styled.div<{ type: string }>`
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background-color: ${(props) => {
    switch (props.type) {
      case 'success':
        return '#4caf50';
      case 'info':
        return '#2196f3';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  }};
  color: white;
  text-align: center;
  border-radius: 4px;
  margin: 0 auto;
  max-width: 80%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.span`
  margin-left: 15px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

export function MessageDisplay() {
  const { message, messageType, hideMessage } = useMessage();

  if (!message) return null;

  return (
    <MessageContainer type={messageType} onClick={hideMessage}>
      <div>{message}</div>
      <CloseButton
        onClick={(e) => {
          e.stopPropagation();
          hideMessage();
        }}
      >
        ✕
      </CloseButton>
    </MessageContainer>
  );
}
