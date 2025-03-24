// src/renderer/styles/CommonStyles.ts
import styled from 'styled-components';

// 우측 정렬 탭 그룹
export const RightTabGroup = styled.div`
  display: flex;
  margin-left: auto; // 우측 정렬
`;

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
`;

export const TabContainer = styled.div`
  display: flex;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  padding: 0;
  margin: 0;
  position: relative; // 상대 위치 설정
`;

export const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  border: none;
  background-color: ${(props) => (props.active ? '#4A90E2' : '#e0e0e0')};
  color: ${(props) => (props.active ? 'white' : '#333')};
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: ${(props) => (props.active ? '3px solid #2c3e50' : 'none')};

  &:hover {
    background-color: ${(props) => (props.active ? '#4A90E2' : '#d0d0d0')};
  }

  &:focus {
    outline: none;
  }

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

export const Description = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #666;
`;

export const Button = styled.button`
  padding: 8px 16px;
  margin: 5px;
  border: none;
  background-color: #4a90e2;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #357abd;
  }
`;

export const Input = styled.input`
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  /* width: 250px; // 고정된 너비 */
  /* max-width: 250px; // 최대 너비 제한 */
`;

export const Select = styled.select`
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 250px; // 고정된 너비
  max-width: 250px; // 최대 너비 제한
`;

export const Label = styled.label`
  margin-right: 15px;
  font-weight: bold;
  width: 120px; // 고정된 라벨 너비
  min-width: 120px; // 최소 너비 유지
  display: inline-block; // 수평 정렬 유지
  text-align: right; // 라벨 텍스트 오른쪽 정렬
`;

export const Section = styled.div`
  margin-bottom: 10px;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

// 전체 화면 컨테이너
export const FullPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

export const FlexContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 20px;
`;

export const SidePanel = styled.div`
  width: 300px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const SidePanelHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: #f8f8f8;
`;

export const SidePanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 5px;
`;

export const ListItem = styled.div<{ active?: boolean }>`
  padding: 10px;
  margin: 5px 0;
  background-color: ${({ active }) => (active ? '#cce4f7' : '#f0f0f0')};
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ active }) => (active ? '#b3d7f0' : '#e5e5e5')};
  }
`;

export const MainPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const TextArea = styled.textarea`
  flex: 1;
  margin: 5px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
  font-family: monospace;
  font-size: 14px;
  min-height: 100px;
  overflow-y: auto;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
`;

export const SelectGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const SmallLabel = styled.label`
  font-size: 0.9rem;
  margin-right: 5px;
`;

export const SmallSelect = styled.select`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

export const MetaInfo = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-top: 3px;
`;

export const DeleteButton = styled(Button)`
  background-color: #e74c3c;
  margin-left: auto; /* 오른쪽 정렬을 위해 */

  &:hover {
    background-color: #c0392b;
  }
`;

export const LeftAlignedLabel = styled(Label)`
  text-align: left;
  width: auto;
  min-width: auto;
`;
