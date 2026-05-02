export interface GraphNode {
  id: string;
  label: string;
  type: string;
  val: number;
  color: string;
  attributes: Record<string, unknown>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  color: string;
  attributes: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const GRAPH_PRESETS: Record<string, GraphData> = {
  SocialNetwork: {
    nodes: [
      { id: 'p1', label: 'Alice', type: 'Person', val: 18, color: '#FF6B35', attributes: { age: 30, city: 'NYC' } },
      { id: 'p2', label: 'Bob', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 27, city: 'LA' } },
      { id: 'p3', label: 'Charlie', type: 'Person', val: 14, color: '#FF6B35', attributes: { age: 35, city: 'Chicago' } },
      { id: 'p4', label: 'Diana', type: 'Person', val: 10, color: '#FF6B35', attributes: { age: 28, city: 'Boston' } },
      { id: 'p5', label: 'Eve', type: 'Person', val: 8, color: '#FF6B35', attributes: { age: 32, city: 'Seattle' } },
      { id: 'p6', label: 'Frank', type: 'Person', val: 9, color: '#FF6B35', attributes: { age: 41, city: 'Austin' } },
      { id: 'c1', label: 'TigerGraph', type: 'Company', val: 20, color: '#2A7FFF', attributes: { industry: 'Tech', founded: 2012 } },
      { id: 'c2', label: 'GraphBase', type: 'Company', val: 16, color: '#2A7FFF', attributes: { industry: 'Analytics', founded: 2018 } },
      { id: 'c3', label: 'DataFlow', type: 'Company', val: 14, color: '#2A7FFF', attributes: { industry: 'AI', founded: 2020 } },
      { id: 't1', label: '#GraphDB', type: 'Topic', val: 12, color: '#2ECC71', attributes: { posts: 1452 } },
      { id: 't2', label: '#ML', type: 'Topic', val: 10, color: '#2ECC71', attributes: { posts: 3200 } },
    ],
    links: [
      { source: 'p1', target: 'p2', type: 'KNOWS', color: '#3D444D', attributes: { since: 2019 } },
      { source: 'p1', target: 'p3', type: 'KNOWS', color: '#3D444D', attributes: { since: 2021 } },
      { source: 'p2', target: 'p4', type: 'KNOWS', color: '#3D444D', attributes: { since: 2022 } },
      { source: 'p3', target: 'p5', type: 'KNOWS', color: '#3D444D', attributes: { since: 2020 } },
      { source: 'p4', target: 'p6', type: 'KNOWS', color: '#3D444D', attributes: { since: 2023 } },
      { source: 'p5', target: 'p6', type: 'KNOWS', color: '#3D444D', attributes: { since: 2021 } },
      { source: 'p1', target: 'c1', type: 'WORKS_AT', color: '#FF6B35', attributes: { role: 'Engineer', startDate: '2021-03' } },
      { source: 'p2', target: 'c2', type: 'WORKS_AT', color: '#FF6B35', attributes: { role: 'Analyst', startDate: '2022-06' } },
      { source: 'p3', target: 'c1', type: 'WORKS_AT', color: '#FF6B35', attributes: { role: 'Manager', startDate: '2020-01' } },
      { source: 'p4', target: 'c3', type: 'WORKS_AT', color: '#FF6B35', attributes: { role: 'Researcher', startDate: '2023-02' } },
      { source: 'p1', target: 't1', type: 'INTERESTED_IN', color: '#2ECC71', attributes: {} },
      { source: 'p2', target: 't2', type: 'INTERESTED_IN', color: '#2ECC71', attributes: {} },
      { source: 'p3', target: 't1', type: 'INTERESTED_IN', color: '#2ECC71', attributes: {} },
      { source: 'p3', target: 't2', type: 'INTERESTED_IN', color: '#2ECC71', attributes: {} },
      { source: 'c1', target: 't1', type: 'TAGGED', color: '#F39C12', attributes: {} },
    ],
  },
  SupplyChain: {
    nodes: [
      { id: 's1', label: 'RawMaterial-A', type: 'Supplier', val: 14, color: '#F39C12', attributes: { region: 'Asia', tier: 1 } },
      { id: 's2', label: 'RawMaterial-B', type: 'Supplier', val: 12, color: '#F39C12', attributes: { region: 'Europe', tier: 1 } },
      { id: 'm1', label: 'Factory-Alpha', type: 'Manufacturer', val: 18, color: '#2A7FFF', attributes: { capacity: 5000, country: 'USA' } },
      { id: 'm2', label: 'Factory-Beta', type: 'Manufacturer', val: 16, color: '#2A7FFF', attributes: { capacity: 3000, country: 'Germany' } },
      { id: 'w1', label: 'Warehouse-East', type: 'Warehouse', val: 14, color: '#9B59B6', attributes: { space: 10000, city: 'Chicago' } },
      { id: 'w2', label: 'Warehouse-West', type: 'Warehouse', val: 14, color: '#9B59B6', attributes: { space: 8000, city: 'LA' } },
      { id: 'r1', label: 'Retailer-NYC', type: 'Retailer', val: 10, color: '#2ECC71', attributes: { stores: 12 } },
      { id: 'r2', label: 'Retailer-CHI', type: 'Retailer', val: 10, color: '#2ECC71', attributes: { stores: 8 } },
      { id: 'r3', label: 'Retailer-LA', type: 'Retailer', val: 10, color: '#2ECC71', attributes: { stores: 15 } },
    ],
    links: [
      { source: 's1', target: 'm1', type: 'SUPPLIES', color: '#F39C12', attributes: { volume: 2000 } },
      { source: 's1', target: 'm2', type: 'SUPPLIES', color: '#F39C12', attributes: { volume: 1000 } },
      { source: 's2', target: 'm1', type: 'SUPPLIES', color: '#F39C12', attributes: { volume: 1500 } },
      { source: 'm1', target: 'w1', type: 'SHIPS_TO', color: '#2A7FFF', attributes: { transit: '3d' } },
      { source: 'm1', target: 'w2', type: 'SHIPS_TO', color: '#2A7FFF', attributes: { transit: '5d' } },
      { source: 'm2', target: 'w1', type: 'SHIPS_TO', color: '#2A7FFF', attributes: { transit: '7d' } },
      { source: 'w1', target: 'r1', type: 'DISTRIBUTES', color: '#9B59B6', attributes: { frequency: 'weekly' } },
      { source: 'w1', target: 'r2', type: 'DISTRIBUTES', color: '#9B59B6', attributes: { frequency: 'daily' } },
      { source: 'w2', target: 'r3', type: 'DISTRIBUTES', color: '#9B59B6', attributes: { frequency: 'daily' } },
    ],
  },
  FraudDetection: {
    nodes: [
      { id: 'a1', label: 'Account-001', type: 'Account', val: 16, color: '#E74C3C', attributes: { balance: 45000, risk: 'high' } },
      { id: 'a2', label: 'Account-002', type: 'Account', val: 10, color: '#2ECC71', attributes: { balance: 2300, risk: 'low' } },
      { id: 'a3', label: 'Account-003', type: 'Account', val: 12, color: '#F39C12', attributes: { balance: 8900, risk: 'medium' } },
      { id: 'a4', label: 'Account-004', type: 'Account', val: 10, color: '#2ECC71', attributes: { balance: 1200, risk: 'low' } },
      { id: 'a5', label: 'Account-005', type: 'Account', val: 14, color: '#E74C3C', attributes: { balance: 67000, risk: 'high' } },
      { id: 'd1', label: 'Device-iPhone', type: 'Device', val: 8, color: '#8B949E', attributes: { os: 'iOS 17', fingerprint: 'abc123' } },
      { id: 'd2', label: 'Device-Android', type: 'Device', val: 8, color: '#8B949E', attributes: { os: 'Android 14', fingerprint: 'xyz789' } },
      { id: 'ip1', label: '192.168.1.1', type: 'IP', val: 12, color: '#9B59B6', attributes: { country: 'RU', flagged: true } },
      { id: 'ip2', label: '10.0.0.55', type: 'IP', val: 8, color: '#3D444D', attributes: { country: 'US', flagged: false } },
      { id: 'tx1', label: 'TXN-$50k', type: 'Transaction', val: 18, color: '#E74C3C', attributes: { amount: 50000, status: 'flagged' } },
    ],
    links: [
      { source: 'a1', target: 'tx1', type: 'INITIATED', color: '#E74C3C', attributes: { timestamp: '2024-01-15T03:22:00Z' } },
      { source: 'a5', target: 'tx1', type: 'RECEIVED', color: '#E74C3C', attributes: {} },
      { source: 'a1', target: 'd1', type: 'USES', color: '#8B949E', attributes: {} },
      { source: 'a3', target: 'd1', type: 'USES', color: '#F39C12', attributes: {} },
      { source: 'a1', target: 'ip1', type: 'ACCESSED_FROM', color: '#9B59B6', attributes: {} },
      { source: 'a5', target: 'ip1', type: 'ACCESSED_FROM', color: '#9B59B6', attributes: {} },
      { source: 'a2', target: 'ip2', type: 'ACCESSED_FROM', color: '#3D444D', attributes: {} },
      { source: 'a2', target: 'd2', type: 'USES', color: '#8B949E', attributes: {} },
      { source: 'a3', target: 'a1', type: 'TRANSFERRED_TO', color: '#F39C12', attributes: { amount: 5000 } },
      { source: 'a4', target: 'a1', type: 'TRANSFERRED_TO', color: '#3D444D', attributes: { amount: 200 } },
    ],
  },
};
