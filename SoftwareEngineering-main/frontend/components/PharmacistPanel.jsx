import React, { useState } from 'react';
import { api } from '../api';
import { Search, CheckCircle, XCircle, Pill } from 'lucide-react';

export default function PharmacistPanel() {
  const [pId, setPId] = useState('');
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    try {
      setMessage('正在从区块链验证...');
      // 调用 verify 接口
      await api.verifyPrescription(pId); 
      // 验证通过后获取最新详情
      const res = await api.getPrescription(pId);
      setData(res.data);
      setMessage('✅ 验证通过：处方有效且未被篡改 (Hash Matched)');
    } catch (err) {
      setData(null);
      setMessage('❌ 验证失败: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDispense = async () => {
    try {
      // 调用 dispense 接口
      await api.dispensePrescription(pId);
      const res = await api.getPrescription(pId);
      setData(res.data);
      setMessage('✅ 发药成功：状态已更新至区块链');
    } catch (err) {
      alert("发药失败: " + err.response?.data?.detail);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-purple-600">💊 药师核验 (Pharmacist)</h2>
      
      <div className="flex gap-2 mb-6">
        <input 
          className="flex-1 border border-gray-300 rounded-md p-2"
          placeholder="输入处方 ID (Prescription ID)"
          value={pId}
          onChange={e => setPId(e.target.value)}
        />
        <button 
          onClick={handleVerify}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
        >
          <Search className="w-4 h-4 mr-2"/> 验证处方
        </button>
      </div>

      {message && <div className="p-3 mb-4 bg-gray-100 rounded text-sm font-medium">{message}</div>}

      {data && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">处方内容</p>
              <p className="font-mono text-lg">{data.payload}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              data.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
              data.status === 'DISPENSED' ? 'bg-gray-200 text-gray-600' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {data.status}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 break-all">Blockchain Hash: {data.hash}</p>
          </div>

          {data.status === 'VERIFIED' && (
            <button 
              onClick={handleDispense}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 flex justify-center items-center font-bold"
            >
              <Pill className="w-5 h-5 mr-2"/> 确认发药 (Dispense)
            </button>
          )}
          
          {data.status === 'DISPENSED' && (
            <div className="mt-6 w-full bg-gray-200 text-gray-500 py-3 rounded-md flex justify-center items-center font-bold cursor-not-allowed">
              <CheckCircle className="w-5 h-5 mr-2"/> 已发药 (Completed)
            </div>
          )}
        </div>
      )}
    </div>
  );
}