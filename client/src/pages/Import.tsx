import { useState, useRef } from 'react';
import { api } from '../api';
import { useFlash } from '../components/Flash';

export default function Import() {
  const [empFile, setEmpFile] = useState<File | null>(null);
  const [salFile, setSalFile] = useState<File | null>(null);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [loadingSal, setLoadingSal] = useState(false);
  const { flash } = useFlash();

  const empInputRef = useRef<HTMLInputElement>(null);
  const salInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (type: 'employees' | 'salaries', file: File | null) => {
    if (!file) {
      flash(`Please select a file for ${type} import.`, 'error');
      return;
    }
    const setLoading = type === 'employees' ? setLoadingEmp : setLoadingSal;
    setLoading(true);
    try {
      const res = await api.importFile(type, file);
      flash(`Successfully imported ${res.imported} ${type} records.`, 'success');
      if (type === 'employees') {
        setEmpFile(null);
        if (empInputRef.current) empInputRef.current.value = '';
      } else {
        setSalFile(null);
        if (salInputRef.current) salInputRef.current.value = '';
      }
    } catch (err: any) {
      flash(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Import Data</h1>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Employee Master</h2>
          <p className="text-sm text-gray-600 mb-4">Upload an Excel file (.xls) containing employee details.</p>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".xls,.xlsx"
              ref={empInputRef}
              onChange={e => setEmpFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <button
              onClick={() => handleImport('employees', empFile)}
              disabled={loadingEmp || !empFile}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 min-w-[100px]"
            >
              {loadingEmp ? 'Importing...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Salary Master</h2>
          <p className="text-sm text-gray-600 mb-4">Upload an Excel file (.xls) containing employee salary details.</p>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".xls,.xlsx"
              ref={salInputRef}
              onChange={e => setSalFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <button
              onClick={() => handleImport('salaries', salFile)}
              disabled={loadingSal || !salFile}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 min-w-[100px]"
            >
              {loadingSal ? 'Importing...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
