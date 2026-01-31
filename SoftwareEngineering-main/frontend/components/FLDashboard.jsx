import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { RefreshCw, Server } from 'lucide-react';

export default function FLDashboard() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchData = async () => {
    try {
      const [sRes, hRes] = await Promise.all([
        api.getFLStatus(), //
        api.getFLHistory() //
      ]);
      setStatus(sRes.data);
      setHistory(hRes.data);
    } catch (err) {
      console.error("FL Server not running?");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // 3秒自动刷新
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center">
          <Server className="mr-2"/> 联邦学习监控 (Federated Learning)
        </h2>
        <button onClick={fetchData} className="text-gray-600 hover:text-indigo-600">
          <RefreshCw className="w-5 h-5"/>
        </button>
      </div>

      {/* 状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
          <h3 className="text-gray-500 text-sm">当前轮次 (Round ID)</h3>
          <p className="text-2xl font-bold">{status?.currentRound || 'Idle'}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm">已连接节点</h3>
          <p className="text-2xl font-bold">{status?.receivedClients?.length || 0} / 2</p>
          <p className="text-xs text-gray-400 mt-1">{status?.receivedClients?.join(', ')}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm">总聚合次数</h3>
          <p className="text-2xl font-bold">{status?.historyRounds || 0}</p>
        </div>
      </div>

      {/* 历史表格 */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-700">全局模型聚合日志</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Round ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Accuracy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-400">暂无聚合记录</td></tr>
            ) : (
              history.slice().reverse().map((row, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{row.roundId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    {(row.avgLocalAcc * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{row.numClients}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}