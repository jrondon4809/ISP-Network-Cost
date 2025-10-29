import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Download, Upload, Trash2, Settings, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import NetworkNode from '@/components/NetworkNode';
import TableNode from '@/components/TableNode';
import Toolbar from '@/components/Toolbar';
import EdgeEditDialog from '@/components/EdgeEditDialog';
import NodeEditDialog from '@/components/NodeEditDialog';
import TableEditDialog from '@/components/TableEditDialog';
import * as XLSX from 'xlsx';

const nodeTypes = {
  networkNode: NetworkNode,
  tableNode: TableNode,
};

export const NetworkDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Auto-calculate Carry In Rent for all nodes based on incoming connections
  useEffect(() => {
    const calculateCarryIn = () => {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          // Only process network nodes
          if (node.type !== 'networkNode') return node;

          // Find ALL incoming edges to this node
          const incomingEdges = edges.filter(edge => edge.target === node.id);

          if (incomingEdges.length === 0) {
            // No incoming connection, Carry In = 0
            if (node.data.carryInRent !== '0') {
              return {
                ...node,
                data: {
                  ...node.data,
                  carryInRent: '0'
                }
              };
            }
            return node;
          }

          // Calculate Carry In from EACH incoming connection and sum them
          let totalCarryIn = 0;

          incomingEdges.forEach(incomingEdge => {
            const sourceNode = currentNodes.find(n => n.id === incomingEdge.source);

            if (!sourceNode || sourceNode.type !== 'networkNode') {
              return;
            }

            // Calculate source node total cost
            const sourceRent = parseFloat(sourceNode.data.rent) || 0;
            const sourceCarryIn = parseFloat(sourceNode.data.carryInRent) || 0;
            const sourceTotalCost = sourceRent + sourceCarryIn;

            // Find ALL outgoing edges from this source node
            const outgoingEdges = edges.filter(e => e.source === sourceNode.id);
            
            // Calculate total sum of all outgoing link bandwidths from this source node
            let totalBandwidth = 0;
            outgoingEdges.forEach(outEdge => {
              const bandwidthStr = outEdge.data?.bandwidth || '100 Mbps';
              const bandwidthMatch = bandwidthStr.match(/(\d+(?:\.\d+)?)/);
              const bandwidth = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : 100;
              totalBandwidth += bandwidth;
            });

            if (totalBandwidth === 0) {
              return;
            }

            // Get bandwidth of this incoming link
            const incomingBandwidthStr = incomingEdge.data?.bandwidth || '100 Mbps';
            const incomingBandwidthMatch = incomingBandwidthStr.match(/(\d+(?:\.\d+)?)/);
            const incomingBandwidth = incomingBandwidthMatch ? parseFloat(incomingBandwidthMatch[1]) : 100;

            // Calculate Carry In from this source: (Source Total Cost ÷ Total Outgoing Bandwidth) × Incoming Link Bandwidth
            const carryInFromThisSource = (sourceTotalCost / totalBandwidth) * incomingBandwidth;
            totalCarryIn += carryInFromThisSource;
          });

          const carryInStr = totalCarryIn.toFixed(2);

          // Only update if value changed
          if (node.data.carryInRent !== carryInStr) {
            return {
              ...node,
              data: {
                ...node.data,
                carryInRent: carryInStr
              }
            };
          }

          return node;
        });
      });
    };

    calculateCarryIn();
  }, [edges, nodes.length]); // Recalculate when edges change or nodes are added/removed

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'default',
        animated: false,
        style: { stroke: 'hsl(var(--link-solid))', strokeWidth: 2 },
        data: {
          proveedor: 'New Provider',
          bandwidth: '100 Mbps',
          mrc: '$100',
          linkType: 'solid'
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Link created successfully');
    },
    []
  );

  const addNode = useCallback(() => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'networkNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        name: `Node ${nodes.filter(n => n.type === 'networkNode').length + 1}`,
        rent: '0',
        carryInRent: '0',
        internetInput: '0',
        internetType: 'input',
        internetCost: '0',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast.success('Node added successfully');
  }, [nodes]);

  const addTable = useCallback(() => {
    const newTable = {
      id: `table-${Date.now()}`,
      type: 'tableNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        name: 'Data Table',
        rows: [
          {
            id: 1,
            client: 'Client 1',
            service: 'Service A',
            bw: '100 Mbps',
            prCost: '$50',
            intCost: '$30',
            eqCost: '$25',
            transpCost: '$20',
            totalCost: '$125',
          },
        ],
      },
    };
    setNodes((nds) => [...nds, newTable]);
    toast.success('Table added successfully');
  }, []);

  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
    toast.success('Selected items deleted');
  }, []);

  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'networkNode') {
      setSelectedNode(node);
    } else if (node.type === 'tableNode') {
      setSelectedTable(node);
    }
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
  }, []);

  const updateNode = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      )
    );
    setSelectedNode(null);
    toast.success('Node updated successfully');
  }, []);

  const updateEdge = useCallback((edgeId, newData) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          let style = { strokeWidth: 2 };
          let animated = false;
          
          switch (newData.linkType) {
            case 'solid':
              style.stroke = 'hsl(var(--link-solid))';
              break;
            case 'dashed':
              style.stroke = 'hsl(var(--link-dashed))';
              style.strokeDasharray = '5,5';
              break;
            case 'arrow':
              style.stroke = 'hsl(var(--link-arrow))';
              animated = true;
              break;
            default:
              style.stroke = 'hsl(var(--link-solid))';
          }
          
          return {
            ...edge,
            data: newData,
            style,
            animated,
            markerEnd: {
              type: 'arrowclosed',
              color: style.stroke,
            },
          };
        }
        return edge;
      })
    );
    setSelectedEdge(null);
    toast.success('Link updated successfully');
  }, []);

  const updateTable = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      )
    );
    setSelectedTable(null);
    toast.success('Table updated successfully');
  }, []);

  const exportDiagram = useCallback(() => {
    const data = {
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-diagram-${Date.now()}.json`;
    link.click();
    toast.success('Diagram exported successfully');
  }, [nodes, edges]);

  const importDiagram = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          toast.success('Diagram imported successfully');
        } catch (error) {
          toast.error('Failed to import diagram');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const clearDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
    toast.success('Diagram cleared');
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas-bg">
      {/* Header */}
      <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Network Diagram Builder</h1>
            <p className="text-xs text-muted-foreground">Design and manage your network topology</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={importDiagram}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportDiagram}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearDiagram}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          onAddNode={addNode}
          onAddTable={addTable}
          onDelete={deleteSelected}
        />

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background
              color="hsl(var(--canvas-grid))"
              gap={20}
              size={1}
              variant="dots"
            />
            <Controls className="bg-card border border-border" />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'networkNode') return 'hsl(var(--primary))';
                if (node.type === 'tableNode') return 'hsl(var(--success))';
                return 'hsl(var(--muted))';
              }}
              maskColor="hsl(var(--background) / 0.8)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Edit Dialogs */}
      {selectedNode && (
        <NodeEditDialog
          node={selectedNode}
          onSave={(data) => updateNode(selectedNode.id, data)}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {selectedEdge && (
        <EdgeEditDialog
          edge={selectedEdge}
          onSave={(data) => updateEdge(selectedEdge.id, data)}
          onClose={() => setSelectedEdge(null)}
        />
      )}

      {selectedTable && (
        <TableEditDialog
          table={selectedTable}
          nodes={nodes}
          edges={edges}
          onSave={(data) => updateTable(selectedTable.id, data)}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
};

export default NetworkDiagram;