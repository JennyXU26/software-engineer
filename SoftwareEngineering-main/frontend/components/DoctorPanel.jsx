import React, { useState } from 'react';
import { api } from '../api';

export default function DoctorPanel() {
  const [form, setForm] = useState({ patient: '', drug: '', dose: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 构造 payload 字符串，模拟 backend1 要求的 payload 格式
      const payloadStr = `Patient:${form.patient},Drug:${form.drug},Dose:${form.dose}`;
      const res = await api.createPrescription(payloadStr);
      setResult(res.data);
    } catch (err) {
      alert("创建失败: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">👨‍⚕️ 医生开方 (Doctor)</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">患者姓名</label>
          <input 
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={form.patient}
            onChange={e => setForm({...form, patient: e.target.value})}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">药品名称</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={form.drug}
              onChange={e => setForm({...form, drug: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">剂量</label>
            <input 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={form.dose}
              onChange={e => setForm({...form, dose: e.target.value})}
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '上链中...' : '生成处方并上链'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="text-green-800 font-semibold">✅ 处方创建成功</h3>
          <p className="text-sm mt-2"><strong>ID:</strong> {result.id}</p>
          <p className="text-sm"><strong>Hash (On-Chain):</strong> {result.hash}</p>
          <p className="text-xs text-gray-500 mt-2">请保存 ID 用于药房验证</p>
        </div>
      )}
    </div>
  );
}