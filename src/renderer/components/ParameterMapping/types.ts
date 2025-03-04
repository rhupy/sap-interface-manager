export interface MappingItem {
  id: string;
  label: string;
  data?: any;
}

export interface MappingConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  data?: any;
}

export interface ParameterMappingProps {
  sourceItems: MappingItem[];
  targetItems: MappingItem[];
  connections: MappingConnection[];
  onConnectionsChange: (connections: MappingConnection[]) => void;
  sourceTitle?: string;
  targetTitle?: string;
  readOnly?: boolean;
  containerStyle?: React.CSSProperties;
}
