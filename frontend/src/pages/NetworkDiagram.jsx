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
import { Plus, Download, Upload, Trash2, Settings, FileSpreadsheet, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import NetworkNode from '@/components/NetworkNode';
import TableNode from '@/components/TableNode';
import CompanyNode from '@/components/CompanyNode';
import Toolbar from '@/components/Toolbar';
import EdgeEditDialog from '@/components/EdgeEditDialog';
import NodeEditDialog from '@/components/NodeEditDialog';
import TableEditDialog from '@/components/TableEditDialog';
import CompanyEditDialog from '@/components/CompanyEditDialog';
import * as XLSX from 'xlsx';

const nodeTypes = {
  networkNode: NetworkNode,
  tableNode: TableNode,
  companyNode: CompanyNode,
};

export const NetworkDiagram = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
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

  // Helper function to recalculate a single table's row values
  const recalculateTableRows = useCallback((table, allNodes, allEdges) => {
    const connectedEdge = allEdges.find(edge => edge.target === table.id);
    if (!connectedEdge) return table.data.rows;

    const sourceNode = allNodes.find(n => n.id === connectedEdge.source);
    if (!sourceNode || sourceNode.type !== 'networkNode') return table.data.rows;

    // Find company node
    const companyNode = allNodes.find(n => n.type === 'companyNode');
    const companyExpensesPerMbps = companyNode 
      ? (parseFloat(companyNode.data.totalExpenses) || 0) / (parseFloat(companyNode.data.totalBW) || 1)
      : 0;

    const rent = parseFloat(sourceNode.data.rent) || 0;
    const carryInRent = parseFloat(sourceNode.data.carryInRent) || 0;
    const nodeTotalCost = rent + carryInRent;
    const nodeInternetCost = parseFloat(sourceNode.data.internetCost) || 0;

    const linkMrcStr = connectedEdge.data?.mrc || '$0';
    const linkMrcMatch = linkMrcStr.match(/(\d+(?:\.\d+)?)/);
    const linkMrc = linkMrcMatch ? parseFloat(linkMrcMatch[1]) : 0;

    const outgoingEdges = allEdges.filter(e => e.source === sourceNode.id);
    let totalOutgoingBandwidth = 0;
    outgoingEdges.forEach(outEdge => {
      const bandwidthStr = outEdge.data?.bandwidth || '100 Mbps';
      const bandwidthMatch = bandwidthStr.match(/(\d+(?:\.\d+)?)/);
      const bandwidth = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : 100;
      totalOutgoingBandwidth += bandwidth;
    });

    if (totalOutgoingBandwidth === 0) return table.data.rows;

    const linkBandwidthStr = connectedEdge.data?.bandwidth || '100 Mbps';
    const linkBandwidthMatch = linkBandwidthStr.match(/(\d+(?:\.\d+)?)/);
    const linkBandwidth = linkBandwidthMatch ? parseFloat(linkBandwidthMatch[1]) : 100;

    let totalTableBandwidth = 0;
    table.data.rows.forEach(row => {
      const rowBwStr = row.bw || '0';
      const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
      const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;
      totalTableBandwidth += rowBandwidth;
    });

    if (totalTableBandwidth === 0) return table.data.rows;

    const prCostPerUnit = (nodeTotalCost / totalOutgoingBandwidth) * linkBandwidth / totalTableBandwidth;
    const intCostPerUnit = (nodeInternetCost * linkBandwidth) / totalTableBandwidth;

    return table.data.rows.map(row => {
      const rowBwStr = row.bw || '0';
      const rowBwMatch = rowBwStr.match(/(\d+(?:\.\d+)?)/);
      const rowBandwidth = rowBwMatch ? parseFloat(rowBwMatch[1]) : 0;

      if (rowBandwidth === 0) {
        return {
          ...row,
          prCost: '$0.00',
          intCost: '$0.00',
          eqCost: '$0.00',
          transpCost: '$0.00',
          eqTrans: '$0.00',
          gastF: '$0.00',
          cTotal: '$0.00',
          eqTotal: '$0.00',
          profit: '$0.00',
          rentPercent: '0.00%'
        };
      }

      const prCost = prCostPerUnit * rowBandwidth;
      const intCost = intCostPerUnit * rowBandwidth;
      const intCostValue = parseFloat(intCost.toFixed(2));
      const eqCost = intCostValue / rowBandwidth;
      const transpCost = (linkMrc * rowBandwidth) / totalTableBandwidth;
      const transpCostValue = parseFloat(transpCost.toFixed(2));
      const eqTrans = transpCostValue / rowBandwidth;
      const gastF = companyExpensesPerMbps * linkBandwidth / totalTableBandwidth * rowBandwidth;
      const cTotal = prCost + intCost + transpCost + gastF;
      const eqTotal = rowBandwidth > 0 ? cTotal / rowBandwidth : 0;

      const priceStr = row.price || '$0';
      const priceMatch = priceStr.match(/(\d+(?:\.\d+)?)/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
      const profit = price - cTotal;
      const rentPercent = price > 0 ? (profit / price) * 100 : 0;

      return {
        ...row,
        prCost: '$' + prCost.toFixed(2),
        intCost: '$' + intCost.toFixed(2),
        eqCost: '$' + eqCost.toFixed(2),
        transpCost: '$' + transpCost.toFixed(2),
        eqTrans: '$' + eqTrans.toFixed(2),
        gastF: '$' + gastF.toFixed(2),
        cTotal: '$' + cTotal.toFixed(2),
        eqTotal: '$' + eqTotal.toFixed(2),
        profit: '$' + profit.toFixed(2),
        rentPercent: rentPercent.toFixed(2) + '%'
      };
    });
  }, []);

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
        animated: true,
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
      style: {
        width: 1000,
        height: 200,
      },
      data: {
        name: 'Data Table',
        maxVisibleRows: 3,
        rows: [
          {
            id: 1,
            client: 'Client 1',
            service: 'Service A',
            bw: '100 Mbps',
            prCost: '$50',
            intCost: '$30',
            eqCost: '$0.30',
            transpCost: '$20',
            eqTrans: '$0.20',
            gastF: '$0.00',
            cTotal: '$0.00',
            eqTotal: '$0.00',
            price: '$500',
            profit: '$0.00',
            rentPercent: '0.00%',
          },
        ],
      },
    };
    setNodes((nds) => [...nds, newTable]);
    toast.success('Table added successfully');
  }, []);

  const addCompany = useCallback(() => {
    // Check if company node already exists
    const companyExists = nodes.some(node => node.type === 'companyNode');
    if (companyExists) {
      toast.error('Company node already exists. Only one company node is allowed.');
      return;
    }

    const newCompany = {
      id: 'company-1',
      type: 'companyNode',
      position: {
        x: 100,
        y: 100,
      },
      data: {
        totalExpenses: 0,
        totalBW: 0,
      },
    };
    setNodes((nds) => [...nds, newCompany]);
    toast.success('Company node added successfully');
  }, [nodes]);


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
    } else if (node.type === 'companyNode') {
      setSelectedCompany(node);
    }
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
  }, []);

  const updateNode = useCallback((nodeId, newData) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      );
      
      // Find all tables connected to this node and recalculate them
      setEdges((currentEdges) => {
        const connectedTables = updatedNodes.filter(node => {
          if (node.type !== 'tableNode') return false;
          // Check if any edge connects this node to the table
          return currentEdges.some(edge => edge.source === nodeId && edge.target === node.id);
        });

        // Recalculate each connected table
        connectedTables.forEach(table => {
          const recalculatedRows = recalculateTableRows(table, updatedNodes, currentEdges);
          const tableIndex = updatedNodes.findIndex(n => n.id === table.id);
          if (tableIndex !== -1) {
            updatedNodes[tableIndex] = {
              ...updatedNodes[tableIndex],
              data: {
                ...updatedNodes[tableIndex].data,
                rows: recalculatedRows
              }
            };
          }
        });

        return currentEdges;
      });

      return updatedNodes;
    });
    setSelectedNode(null);
    toast.success('Node updated successfully');
  }, [recalculateTableRows]);

  const updateEdge = useCallback((edgeId, newData) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          let style = { strokeWidth: 2 };
          let animated = true; // All link types are now animated
          
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

  const updateCompany = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      )
    );
    setSelectedCompany(null);
    toast.success('Company updated successfully');
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

  const exportToExcel = useCallback(() => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Nodes Summary
      const networkNodes = nodes.filter(n => n.type === 'networkNode');
      const nodesData = networkNodes.map(node => ({
        'Node Name': node.data.name || '',
        'Rent ($)': node.data.rent || '0',
        'Carry In Rent ($)': node.data.carryInRent || '0',
        'Total Cost ($)': (parseFloat(node.data.rent || 0) + parseFloat(node.data.carryInRent || 0)).toFixed(2),
        'Internet (Mbps)': node.data.internetInput || '0',
        'Internet Type': node.data.internetType === 'output' ? 'OUT' : 'IN',
        'Internet Cost ($/Mbps)': node.data.internetCost || '0'
      }));
      const wsNodes = XLSX.utils.json_to_sheet(nodesData);
      XLSX.utils.book_append_sheet(wb, wsNodes, 'Nodes');

      // Sheet 2: Links Summary
      const linksData = edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        return {
          'From': sourceNode?.data?.name || 'Unknown',
          'To': targetNode?.data?.name || 'Unknown',
          'Link Type': edge.data?.linkType === 'solid' ? 'Fiber OFF Net' : 
                       edge.data?.linkType === 'dashed' ? 'Wireless ON Net' : 'Fiber ON NET',
          'Proveedor': edge.data?.proveedor || '',
          'Bandwidth': edge.data?.bandwidth || '100 Mbps',
          'MRC ($)': edge.data?.mrc || ''
        };
      });
      const wsLinks = XLSX.utils.json_to_sheet(linksData);
      XLSX.utils.book_append_sheet(wb, wsLinks, 'Links');

      // Sheet 3+: One sheet per table with formulas
      const tableNodes = nodes.filter(n => n.type === 'tableNode');
      tableNodes.forEach((tableNode, index) => {
        const tableName = tableNode.data.name || `Table ${index + 1}`;
        const sheetName = tableName.substring(0, 31); // Excel sheet name limit
        
        // Find connected node
        const incomingEdge = edges.find(e => e.target === tableNode.id);
        let connectedNodeName = 'N/A';
        if (incomingEdge) {
          const sourceNode = nodes.find(n => n.id === incomingEdge.source);
          connectedNodeName = sourceNode?.data?.name || 'Unknown';
        }

        // Create table data with formulas
        const tableData = [];
        
        // Header info
        tableData.push(['Table Name:', tableName]);
        tableData.push(['Connected to Node:', connectedNodeName]);
        tableData.push([]); // Empty row
        
        // Column headers
        tableData.push([
          'Client',
          'Service',
          'BW',
          'PR Cost ($)',
          'Int Cost ($)',
          'EQ $/Mbps ($)',
          'Transp Cost ($)',
          'Total Cost ($)'
        ]);

        // Data rows
        if (tableNode.data.rows && tableNode.data.rows.length > 0) {
          tableNode.data.rows.forEach(row => {
            tableData.push([
              row.client || '',
              row.service || '',
              row.bw || '',
              row.prCost || '',
              row.intCost || '',
              row.eqCost || '',
              row.transpCost || '',
              row.totalCost || ''
            ]);
          });
        }

        const wsTable = XLSX.utils.aoa_to_sheet(tableData);
        
        // Set column widths
        wsTable['!cols'] = [
          { wch: 15 }, // Client
          { wch: 15 }, // Service
          { wch: 12 }, // BW
          { wch: 12 }, // PR Cost
          { wch: 12 }, // Int Cost
          { wch: 15 }, // EQ $/Mbps
          { wch: 12 }, // Transp Cost
          { wch: 12 }  // Total Cost
        ];

        XLSX.utils.book_append_sheet(wb, wsTable, sheetName);
      });

      // Generate Excel file and download
      const fileName = `network-diagram-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel file');
    }
  }, [nodes, edges]);

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
            onClick={addCompany}
            className="gap-2"
          >
            <Building2 className="w-4 h-4" />
            Add Company
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
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

      {selectedCompany && (
        <CompanyEditDialog
          company={selectedCompany}
          onSave={(data) => updateCompany(selectedCompany.id, data)}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
};

export default NetworkDiagram;