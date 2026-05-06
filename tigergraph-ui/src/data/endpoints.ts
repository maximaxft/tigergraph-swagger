import { type GraphData } from './graphData';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'body';
  type: string;
  required: boolean;
  description: string;
  example?: string;
  options?: string[];
}

export interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tag: string;
  parameters: Parameter[];
  responseExample: object;
  networkxExample: GraphData;
}

export interface Tag {
  name: string;
  description: string;
}

export const tags: Tag[] = [
  { name: 'Graph', description: 'Graph schema and topology operations' },
  { name: 'Vertex', description: 'Vertex (node) CRUD operations' },
  { name: 'Edge', description: 'Edge relationship operations' },
  { name: 'Query', description: 'GSQL query execution' },
  { name: 'Analytics', description: 'Graph analytics and algorithms' },
];

export const endpoints: Endpoint[] = [
  {
    id: 'get-entities',
    method: 'GET',
    path: '/get-entites',
    summary: 'Get All Entities',
    description: 'Returns every vertex of the specified type with all its attributes.',
    tag: 'Single Entity',
    parameters: [
      { name: 'vertex_type', in: 'query', type: 'string', required: true, description: 'Vertex type to query', example: 'Service', options: ['Service', 'Incident', 'Change', 'BusinessApplication', 'Application', 'Person', 'Company'] },
      { name: 'limit', in: 'query', type: 'integer', required: false, description: 'Max number of vertices to return (1–5000)', example: '100' },
    ],
    responseExample: {
      graphs: ['SocialNetwork', 'SupplyChain', 'FraudDetection'],
      count: 1,
    },
    networkxExample: {
      nodes: [
        { id: 'db', label: 'TigerGraph DB', type: 'Database', val: 20, color: '#FF6B35', attributes: { version: '3.9' } },
        { id: 'g1', label: 'SocialNetwork', type: 'Graph', val: 14, color: '#2A7FFF', attributes: { vertices: 120, edges: 540 } },
        { id: 'g2', label: 'SupplyChain', type: 'Graph', val: 12, color: '#2A7FFF', attributes: { vertices: 80, edges: 220 } },
        { id: 'g3', label: 'FraudDetection', type: 'Graph', val: 13, color: '#2A7FFF', attributes: { vertices: 95, edges: 310 } },
      ],
      links: [
        { source: 'db', target: 'g1', type: 'CONTAINS', color: '#3D444D', attributes: {} },
        { source: 'db', target: 'g2', type: 'CONTAINS', color: '#3D444D', attributes: {} },
        { source: 'db', target: 'g3', type: 'CONTAINS', color: '#3D444D', attributes: {} },
      ],
    },
  },
  {
    id: 'get-impacted-entities',
    method: 'GET',
    path: '/get-impacted-entities',
    summary: 'Get All Entities',
    description: 'Returns every vertex of the specified type with all its attributes.',
    tag: 'Impacted Entities',
    parameters: [{ name: 'vertex_type', in: 'query', type: 'string', required: true, description: 'Vertex type to query', example: 'Service', options: ['Service', 'Incident', 'Change', 'BusinessApplication', 'Application', 'Person', 'Company'] }],
    responseExample: {
      graphs: ['SocialNetwork', 'SupplyChain', 'FraudDetection'],
      count: 1,
    },
    networkxExample: {
      nodes: [
        { id: 'db', label: 'TigerGraph DB', type: 'Database', val: 20, color: '#FF6B35', attributes: { version: '3.9' } },
        { id: 'g1', label: 'SocialNetwork', type: 'Graph', val: 14, color: '#2A7FFF', attributes: { vertices: 120, edges: 540 } },
        { id: 'g2', label: 'SupplyChain', type: 'Graph', val: 12, color: '#2A7FFF', attributes: { vertices: 80, edges: 220 } },
        { id: 'g3', label: 'FraudDetection', type: 'Graph', val: 13, color: '#2A7FFF', attributes: { vertices: 95, edges: 310 } },
      ],
      links: [
        { source: 'db', target: 'g1', type: 'CONTAINS', color: '#3D444D', attributes: {} },
        { source: 'db', target: 'g2', type: 'CONTAINS', color: '#3D444D', attributes: {} },
        { source: 'db', target: 'g3', type: 'CONTAINS', color: '#3D444D', attributes: {} },
      ],
    },
  },
];
