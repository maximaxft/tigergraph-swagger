import { type GraphData } from './graphData';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'body';
  type: string;
  required: boolean;
  description: string;
  example?: string;
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
    id: 'get-graphs',
    method: 'GET',
    path: '/gsqlserver/gsql/getsession',
    summary: 'List all graphs',
    description: 'Returns a list of all graphs available in the TigerGraph database instance.',
    tag: 'Graph',
    parameters: [],
    responseExample: {
      graphs: ['SocialNetwork', 'SupplyChain', 'FraudDetection'],
      count: 3,
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
    id: 'get-schema',
    method: 'GET',
    path: '/gsqlserver/gsql/schema',
    summary: 'Get graph schema',
    description: 'Returns the full schema definition including vertex types, edge types, and attributes.',
    tag: 'Graph',
    parameters: [
      { name: 'graph', in: 'query', type: 'string', required: true, description: 'Target graph name', example: 'SocialNetwork' },
    ],
    responseExample: {
      vertexTypes: [
        { name: 'Person', attributes: ['id', 'name', 'age'] },
        { name: 'Company', attributes: ['id', 'name', 'industry'] },
      ],
      edgeTypes: [
        { name: 'KNOWS', from: 'Person', to: 'Person', attributes: ['since'] },
        { name: 'WORKS_AT', from: 'Person', to: 'Company', attributes: ['role', 'startDate'] },
      ],
    },
    networkxExample: {
      nodes: [
        { id: 'Person', label: 'Person', type: 'VertexType', val: 16, color: '#FF6B35', attributes: { attributes: 'id, name, age' } },
        { id: 'Company', label: 'Company', type: 'VertexType', val: 16, color: '#2A7FFF', attributes: { attributes: 'id, name, industry' } },
      ],
      links: [
        { source: 'Person', target: 'Person', type: 'KNOWS', color: '#3D444D', attributes: { attributes: 'since' } },
        { source: 'Person', target: 'Company', type: 'WORKS_AT', color: '#FF6B35', attributes: { attributes: 'role, startDate' } },
      ],
    },
  },
  {
    id: 'get-vertices',
    method: 'GET',
    path: '/restpp/graph/{graph_name}/vertices/{vertex_type}',
    summary: 'List vertices',
    description: 'Retrieve all vertices of a specific type from the graph.',
    tag: 'Vertex',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Name of the graph', example: 'SocialNetwork' },
      { name: 'vertex_type', in: 'path', type: 'string', required: true, description: 'Type of vertex', example: 'Person' },
      { name: 'limit', in: 'query', type: 'integer', required: false, description: 'Max results to return', example: '100' },
      { name: 'filter', in: 'query', type: 'string', required: false, description: 'Filter expression', example: 'age>25' },
    ],
    responseExample: {
      results: [
        { v_id: 'p1', v_type: 'Person', attributes: { name: 'Alice', age: 30 } },
        { v_id: 'p2', v_type: 'Person', attributes: { name: 'Bob', age: 27 } },
        { v_id: 'p3', v_type: 'Person', attributes: { name: 'Charlie', age: 35 } },
      ],
    },
    networkxExample: {
      nodes: [
        { id: 'p1', label: 'Alice', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 30 } },
        { id: 'p2', label: 'Bob', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 27 } },
        { id: 'p3', label: 'Charlie', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 35 } },
      ],
      links: [],
    },
  },
  {
    id: 'get-vertex-by-id',
    method: 'GET',
    path: '/restpp/graph/{graph_name}/vertices/{vertex_type}/{vertex_id}',
    summary: 'Get vertex by ID',
    description: 'Retrieve a specific vertex and all its attributes by its unique identifier.',
    tag: 'Vertex',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Name of the graph', example: 'SocialNetwork' },
      { name: 'vertex_type', in: 'path', type: 'string', required: true, description: 'Type of vertex', example: 'Person' },
      { name: 'vertex_id', in: 'path', type: 'string', required: true, description: 'Vertex unique identifier', example: 'p1' },
    ],
    responseExample: {
      results: [{ v_id: 'p1', v_type: 'Person', attributes: { name: 'Alice', age: 30, email: 'alice@example.com' } }],
    },
    networkxExample: {
      nodes: [
        { id: 'p1', label: 'Alice', type: 'Person', val: 18, color: '#FF6B35', attributes: { age: 30, email: 'alice@example.com' } },
        { id: 'p2', label: 'Bob', type: 'Person', val: 10, color: '#FF6B35', attributes: { age: 27 } },
        { id: 'p3', label: 'Charlie', type: 'Person', val: 10, color: '#FF6B35', attributes: { age: 35 } },
        { id: 'c1', label: 'TigerGraph', type: 'Company', val: 14, color: '#2A7FFF', attributes: { industry: 'Tech' } },
      ],
      links: [
        { source: 'p1', target: 'p2', type: 'KNOWS', color: '#3D444D', attributes: { since: 2019 } },
        { source: 'p1', target: 'p3', type: 'KNOWS', color: '#3D444D', attributes: { since: 2021 } },
        { source: 'p1', target: 'c1', type: 'WORKS_AT', color: '#FF6B35', attributes: { role: 'Engineer' } },
      ],
    },
  },
  {
    id: 'upsert-vertex',
    method: 'POST',
    path: '/restpp/graph/{graph_name}',
    summary: 'Upsert vertices',
    description: 'Insert or update one or more vertices in the graph. Existing vertices are updated; new ones are created.',
    tag: 'Vertex',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Name of the graph', example: 'SocialNetwork' },
      {
        name: 'body',
        in: 'body',
        type: 'object',
        required: true,
        description: 'Vertex upsert payload',
        example: JSON.stringify({ vertices: { Person: { p3: { name: { value: 'Charlie' }, age: { value: 35 } } } } }, null, 2),
      },
    ],
    responseExample: { accepted_vertices: 1, accepted_edges: 0 },
    networkxExample: {
      nodes: [
        { id: 'p3', label: 'Charlie', type: 'Person', val: 16, color: '#2ECC71', attributes: { name: 'Charlie', age: 35, status: 'upserted' } },
      ],
      links: [],
    },
  },
  {
    id: 'delete-vertex',
    method: 'DELETE',
    path: '/restpp/graph/{graph_name}/vertices/{vertex_type}/{vertex_id}',
    summary: 'Delete vertex',
    description: 'Permanently delete a vertex and all its incident edges from the graph.',
    tag: 'Vertex',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Name of the graph', example: 'SocialNetwork' },
      { name: 'vertex_type', in: 'path', type: 'string', required: true, description: 'Vertex type', example: 'Person' },
      { name: 'vertex_id', in: 'path', type: 'string', required: true, description: 'Vertex ID to delete', example: 'p3' },
    ],
    responseExample: { deleted_vertices: 1 },
    networkxExample: { nodes: [], links: [] },
  },
  {
    id: 'get-edges',
    method: 'GET',
    path: '/restpp/graph/{graph_name}/edges/{src_type}/{src_id}',
    summary: 'Get edges from vertex',
    description: 'Returns all edges emanating from a specific source vertex, optionally filtered by edge type or target.',
    tag: 'Edge',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Graph name', example: 'SocialNetwork' },
      { name: 'src_type', in: 'path', type: 'string', required: true, description: 'Source vertex type', example: 'Person' },
      { name: 'src_id', in: 'path', type: 'string', required: true, description: 'Source vertex ID', example: 'p1' },
      { name: 'edge_type', in: 'query', type: 'string', required: false, description: 'Filter by edge type', example: 'KNOWS' },
    ],
    responseExample: {
      results: [
        { e_type: 'KNOWS', from_id: 'p1', from_type: 'Person', to_id: 'p2', to_type: 'Person', attributes: { since: 2019 } },
        { e_type: 'KNOWS', from_id: 'p1', from_type: 'Person', to_id: 'p3', to_type: 'Person', attributes: { since: 2021 } },
      ],
    },
    networkxExample: {
      nodes: [
        { id: 'p1', label: 'Alice', type: 'Person', val: 18, color: '#FF6B35', attributes: { age: 30 } },
        { id: 'p2', label: 'Bob', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 27 } },
        { id: 'p3', label: 'Charlie', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 35 } },
      ],
      links: [
        { source: 'p1', target: 'p2', type: 'KNOWS', color: '#3D444D', attributes: { since: 2019 } },
        { source: 'p1', target: 'p3', type: 'KNOWS', color: '#3D444D', attributes: { since: 2021 } },
      ],
    },
  },
  {
    id: 'upsert-edges',
    method: 'POST',
    path: '/restpp/graph/{graph_name}',
    summary: 'Upsert edges',
    description: 'Insert or update edges between vertices. Edges are created if they do not exist, or updated if they do.',
    tag: 'Edge',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Graph name', example: 'SocialNetwork' },
      {
        name: 'body',
        in: 'body',
        type: 'object',
        required: true,
        description: 'Edge upsert payload',
        example: JSON.stringify({ edges: { Person: { p1: { KNOWS: { Person: { p3: { since: { value: 2024 } } } } } } } }, null, 2),
      },
    ],
    responseExample: { accepted_vertices: 0, accepted_edges: 1 },
    networkxExample: {
      nodes: [
        { id: 'p1', label: 'Alice', type: 'Person', val: 14, color: '#FF6B35', attributes: { age: 30 } },
        { id: 'p3', label: 'Charlie', type: 'Person', val: 14, color: '#FF6B35', attributes: { age: 35 } },
      ],
      links: [
        { source: 'p1', target: 'p3', type: 'KNOWS', color: '#2ECC71', attributes: { since: 2024, status: 'upserted' } },
      ],
    },
  },
  {
    id: 'run-query',
    method: 'POST',
    path: '/restpp/query/{graph_name}/{query_name}',
    summary: 'Run installed query',
    description: 'Execute a pre-installed GSQL query on the graph. Queries must be installed before they can be run via REST.',
    tag: 'Query',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Target graph', example: 'SocialNetwork' },
      { name: 'query_name', in: 'path', type: 'string', required: true, description: 'Installed query name', example: 'findFriends' },
      { name: 'p', in: 'query', type: 'string', required: false, description: 'Query parameter (key=value)', example: 'person_id=p1' },
    ],
    responseExample: {
      results: [{ friends: [{ v_id: 'p2', attributes: { name: 'Bob' } }, { v_id: 'p3', attributes: { name: 'Charlie' } }] }],
    },
    networkxExample: {
      nodes: [
        { id: 'p1', label: 'Alice', type: 'Person', val: 20, color: '#FF6B35', attributes: { age: 30, role: 'source' } },
        { id: 'p2', label: 'Bob', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 27 } },
        { id: 'p3', label: 'Charlie', type: 'Person', val: 12, color: '#FF6B35', attributes: { age: 35 } },
        { id: 'p4', label: 'Diana', type: 'Person', val: 10, color: '#FF6B35', attributes: { age: 28 } },
        { id: 'p5', label: 'Eve', type: 'Person', val: 10, color: '#FF6B35', attributes: { age: 32 } },
      ],
      links: [
        { source: 'p1', target: 'p2', type: 'KNOWS', color: '#3D444D', attributes: { since: 2019 } },
        { source: 'p1', target: 'p3', type: 'KNOWS', color: '#3D444D', attributes: { since: 2021 } },
        { source: 'p2', target: 'p4', type: 'KNOWS', color: '#3D444D', attributes: { since: 2022 } },
        { source: 'p3', target: 'p5', type: 'KNOWS', color: '#3D444D', attributes: { since: 2020 } },
      ],
    },
  },
  {
    id: 'interpret-query',
    method: 'POST',
    path: '/gsqlserver/gsql/interpretQuery',
    summary: 'Interpret GSQL query',
    description: 'Submit an ad-hoc GSQL query for immediate interpretation without installation. Useful for development and exploration.',
    tag: 'Query',
    parameters: [
      {
        name: 'body',
        in: 'body',
        type: 'string',
        required: true,
        description: 'Raw GSQL query string',
        example: 'INTERPRET QUERY () FOR GRAPH SocialNetwork { PRINT "Hello TigerGraph"; }',
      },
    ],
    responseExample: { results: [{ output: 'Hello TigerGraph' }] },
    networkxExample: { nodes: [], links: [] },
  },
  {
    id: 'shortest-path',
    method: 'GET',
    path: '/restpp/query/{graph_name}/shortest_path',
    summary: 'Shortest path',
    description: 'Compute the shortest path between two vertices using BFS traversal.',
    tag: 'Analytics',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Graph name', example: 'SocialNetwork' },
      { name: 'source', in: 'query', type: 'string', required: true, description: 'Source vertex ID', example: 'p1' },
      { name: 'target', in: 'query', type: 'string', required: true, description: 'Target vertex ID', example: 'p5' },
    ],
    responseExample: { path: ['p1', 'p2', 'p4', 'p5'], length: 3 },
    networkxExample: {
      nodes: [
        { id: 'p1', label: 'Alice', type: 'Person', val: 16, color: '#2ECC71', attributes: { role: 'source' } },
        { id: 'p2', label: 'Bob', type: 'Person', val: 12, color: '#F39C12', attributes: { role: 'intermediate' } },
        { id: 'p4', label: 'Diana', type: 'Person', val: 12, color: '#F39C12', attributes: { role: 'intermediate' } },
        { id: 'p5', label: 'Eve', type: 'Person', val: 16, color: '#E74C3C', attributes: { role: 'target' } },
      ],
      links: [
        { source: 'p1', target: 'p2', type: 'KNOWS', color: '#2ECC71', attributes: { hop: 1 } },
        { source: 'p2', target: 'p4', type: 'KNOWS', color: '#2ECC71', attributes: { hop: 2 } },
        { source: 'p4', target: 'p5', type: 'KNOWS', color: '#2ECC71', attributes: { hop: 3 } },
      ],
    },
  },
  {
    id: 'pagerank',
    method: 'POST',
    path: '/restpp/query/{graph_name}/pagerank',
    summary: 'PageRank algorithm',
    description: 'Run the PageRank algorithm to compute node importance scores across the entire graph.',
    tag: 'Analytics',
    parameters: [
      { name: 'graph_name', in: 'path', type: 'string', required: true, description: 'Graph name', example: 'SocialNetwork' },
      { name: 'max_iter', in: 'query', type: 'integer', required: false, description: 'Maximum iterations', example: '25' },
      { name: 'damping', in: 'query', type: 'float', required: false, description: 'Damping factor (0-1)', example: '0.85' },
    ],
    responseExample: {
      results: [
        { vertex: 'p1', score: 0.312 },
        { vertex: 'p3', score: 0.289 },
        { vertex: 'p2', score: 0.198 },
        { vertex: 'p4', score: 0.134 },
        { vertex: 'p5', score: 0.067 },
      ],
    },
    networkxExample: {
      nodes: [
        { id: 'p1', label: 'Alice', type: 'Person', val: 28, color: '#FF6B35', attributes: { pagerank: 0.312 } },
        { id: 'p3', label: 'Charlie', type: 'Person', val: 24, color: '#FF8C5A', attributes: { pagerank: 0.289 } },
        { id: 'p2', label: 'Bob', type: 'Person', val: 18, color: '#FFA07A', attributes: { pagerank: 0.198 } },
        { id: 'p4', label: 'Diana', type: 'Person', val: 14, color: '#8B949E', attributes: { pagerank: 0.134 } },
        { id: 'p5', label: 'Eve', type: 'Person', val: 10, color: '#3D444D', attributes: { pagerank: 0.067 } },
      ],
      links: [
        { source: 'p1', target: 'p2', type: 'KNOWS', color: '#3D444D', attributes: {} },
        { source: 'p1', target: 'p3', type: 'KNOWS', color: '#3D444D', attributes: {} },
        { source: 'p3', target: 'p2', type: 'KNOWS', color: '#3D444D', attributes: {} },
        { source: 'p3', target: 'p4', type: 'KNOWS', color: '#3D444D', attributes: {} },
        { source: 'p2', target: 'p5', type: 'KNOWS', color: '#3D444D', attributes: {} },
      ],
    },
  },
];
