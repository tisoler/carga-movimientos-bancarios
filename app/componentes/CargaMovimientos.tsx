'use client';
import { ChangeEvent, useEffect, useState } from 'react';
import { CodigoEvo } from '../modelos/codigoEvo';
import { Relacion } from '../modelos/relacion';

interface Movimiento {
  id?: number;
  fecha: string;
  codigoConcepto: number;
  descripcionConcepto: string;
  identificadorMovimiento: string;
  montoDebito: number;
  montoCredito: number;
  saldo: number;
  transferenciaCUIT: string;
  codigoConceptoEvo: number;
};

const HEADERS = ['Fecha', 'Código', 'Concepto', 'Identificador', 'Débito', 'Crédito', 'Saldo', 'CUIT Transferencia', 'Código EVO'];

export default function CargaMovimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [codigosEvo, setCodigosEvo] = useState<CodigoEvo[]>([]);
  const [relacionesCodigo, setRelacionesCodigo] = useState<Relacion[]>([]);

  useEffect(() => {
    const fetchCodigosEvo = async () => {
      const res = await fetch('/api/codigoEvo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();

      if (res.ok && data) {
        setCodigosEvo(data);
      }
    };
    const fetchRelaciones = async () => {
      const res = await fetch('/api/relacion', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await res.json();

      if (res.ok && data) {
        setRelacionesCodigo(data);
      }
    };

    fetchCodigosEvo();
    fetchRelaciones();
  }, []);

  const parseCSV = async (csvText: string): Promise<Movimiento[]> => {
    const lines = csvText.split('\n');
    const transactions: Movimiento[] = [];
    let dataStartIndex = 0;

    // Find the header line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('Fecha,Código concepto,Concepto,Débito,Crédito,Saldo,CUIT Transferencia')) {
        dataStartIndex = i + 1; // Start from next line
        break;
      }
    }

    // Parse each data line
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted fields that might contain commas
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char + line[j+1] === '""') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim().replaceAll('"', '')); // Remove extra quotes
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim().replaceAll('"', '')); // Add last field

      if (fields.length > 0) {
        const codigoConcepto = !isNaN(Number(fields[1])) ? parseInt(fields[1]) : 0;
        const conceptoArray = fields[2]?.split(/\s{2}-\s{2}/) || []; // Obtener el concepto y el identificador (si hay)
        const concepto = conceptoArray[0]?.trim() || '';
        const identificador = conceptoArray?.length > 1 ? conceptoArray[1]?.trim() : '';
        const montoDebito = fields[3]?.replaceAll('$', '').replaceAll('.', '').replaceAll(',', '.').trim();
        const montoCredito = fields[4]?.replaceAll('$', '').replaceAll('.', '').replaceAll(',', '.').trim();
        const saldo = fields[5]?.replaceAll('$', '').replaceAll('.', '').replaceAll(',', '.').trim();
        transactions.push({
          fecha: fields[0],
          codigoConcepto,
          descripcionConcepto: concepto,
          identificadorMovimiento: identificador,
          montoDebito: !isNaN(Number(montoDebito)) ? parseFloat(montoDebito) : 0,
          montoCredito: !isNaN(Number(montoCredito)) ? parseFloat(montoCredito) : 0,
          saldo: !isNaN(Number(saldo)) ? parseFloat(saldo) : 0,
          transferenciaCUIT: fields[6],
          codigoConceptoEvo: relacionesCodigo?.find(rel => rel.codigoConcepto === codigoConcepto)?.codigoConceptoEvo || -1,
        });
      }
    }

    return transactions;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCargando(true);
    setError('');
    setMovimientos([]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        const parsedData = await parseCSV(csvText);
        setMovimientos(parsedData);
      } catch (err) {
        setError('Error parsing CSV file');
        console.error('Parsing error:', err);
      } finally {
        setCargando(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
      setCargando(false);
    };
    reader.readAsText(file, 'ISO-8859-1');
  };

  const handleGuardar = async () => {
    if (movimientos?.length === 0) { return; }

    setCargando(true);
    setError('');
    try {
      const response = await fetch('/api/movimiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimientos),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los movimientos');
      }

      await response.json();
      setMovimientos([]);
    } catch (err) {
      setError('Error al guardar los movimientos: ' + (err as Error).message);
      console.error('Save error:', err);
    }
    setCargando(false);
  }

  const handleSeleccionarCodigoEvo = (e: ChangeEvent<HTMLSelectElement>, index: number): void => {
    if (!e.target.value || !movimientos[index]) return;
    const codigoConcepto = movimientos[index].codigoConcepto;
    const codigoConceptoEvo = parseInt(e.target.value);
    setMovimientos(prevState => {
      return prevState.map((mov) => {
        if (mov.codigoConcepto === codigoConcepto) {
          return {
            ...mov,
            codigoConceptoEvo,
          };
        }
        return mov;
      });
    });
  }

  return (
    <div className="container mx-auto p-4">
      <div className='flex flex-col gap-3 w-full items-center'>
        <h1 className="text-2xl font-bold mb-4">Movimientos bancarios</h1>
        <div className="flex items-center justify-center gap-3 w-full">
          <div className='flex flex-col justify-center w-4/12'>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-white
                file:p-5 gap-3
                file:rounded-md file:border-0
                file:font-bold file:mr-3
                file:bg-blue-900 file:text-white
                hover:file:bg-blue-600 file:cursor-pointer"
            />
          </div>
          <button className='bg-green-900 hover:bg-green-600 rounded-sm p-5 cursor-pointer font-bold' onClick={handleGuardar}>Guardar</button>
        </div>
      </div>

      {isLoading && <div className="text-center py-4">Cargando y procesando archivo...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {movimientos?.length > 0 && codigosEvo?.length > 0 && (
        <div className="overflow-x-auto">
          <div className="mb-2 text-sm text-white">
            {movimientos.length} movimientos
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {HEADERS?.map((header: string) => (
                  <th
                    key={header}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${header === 'Código EVO' ? 'w-[900px]' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientos.map((mov, index) => (
                <tr key={index}>
                  {Object.keys(mov)?.map((key: string) => (
                    <td
                      key={`${index}-${key}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {
                        key === 'codigoConceptoEvo'
                          ? (
                            <select value={mov?.codigoConceptoEvo} onChange={(e) => handleSeleccionarCodigoEvo(e, index)}>
                              <option value="">Seleccionar código</option>
                              {codigosEvo?.map((codigo) => (
                                <option key={codigo.codigoConceptoEvo} value={codigo.codigoConceptoEvo}>
                                  {`${codigo.codigoConceptoEvo} - ${codigo.descripcionConceptoEvo}`}
                                </option>
                              ))}
                            </select>
                          )
                          : mov[key as keyof Movimiento] || '-'
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
