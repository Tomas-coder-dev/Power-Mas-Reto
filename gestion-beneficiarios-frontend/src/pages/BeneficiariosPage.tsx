import React, { useEffect, useState } from "react";
import type { DocumentoIdentidad } from "../models/DocumentoIdentidad";
import type { Beneficiario } from "../models/Beneficiario";
import { fetchDocumentosIdentidad } from "../api/documentosApi";
import {
  fetchBeneficiarios,
  deleteBeneficiario,
} from "../api/beneficiariosApi";
import BeneficiarioForm from "../components/BeneficiarioForm";

const BeneficiariosPage: React.FC = () => {
  const [documentos, setDocumentos] = useState<DocumentoIdentidad[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [beneficiarioEdit, setBeneficiarioEdit] = useState<Beneficiario | null>(
    null
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, bens] = await Promise.all([
        fetchDocumentosIdentidad(),
        fetchBeneficiarios(),
      ]);
      setDocumentos(docs);
      setBeneficiarios(bens);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar datos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Desea eliminar este beneficiario?")) return;
    try {
      await deleteBeneficiario(id);
      await loadData();
      if (beneficiarioEdit && beneficiarioEdit.id === id) {
        setBeneficiarioEdit(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar";
      window.alert(msg);
    }
  };

  const handleEdit = (b: Beneficiario) => {
    setBeneficiarioEdit(b);
  };

  const handleCancelEdit = () => {
    setBeneficiarioEdit(null);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-sky-700 text-white py-4 shadow">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">
            Sistema de Gestión de Beneficiarios
          </h1>
          <span className="text-xs md:text-sm text-sky-100">
            Prueba Técnica PowerMass
          </span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Formulario */}
        <section>
          <BeneficiarioForm
            documentos={documentos}
            onSaved={loadData}
            beneficiarioEdit={beneficiarioEdit}
            onCancelEdit={handleCancelEdit}
          />
        </section>

        {/* Tabla */}
        <section className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Listado de Beneficiarios
            </h2>
            {loading && (
              <span className="text-xs text-slate-500">Cargando datos...</span>
            )}
          </div>

          <div className="overflow-x-auto">
            {beneficiarios.length === 0 && !loading ? (
              <p className="px-4 py-4 text-sm text-slate-500">
                No hay beneficiarios registrados.
              </p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">
                      Documento
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">
                      Fecha Nac.
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">
                      Sexo
                    </th>
                    <th className="py-3 px-4 font-medium text-slate-600 text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiarios.map((b, idx) => (
                    <tr
                      key={b.id}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      }
                    >
                      <td className="py-2.5 px-4 text-slate-800">
                        <span className="font-medium">{b.apellidos}</span>,{" "}
                        {b.nombres}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        <span className="font-semibold">
                          {b.abreviatura ?? ""}
                        </span>{" "}
                        {b.numeroDocumento}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {b.fechaNacimiento.substring(0, 10)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">{b.sexo}</td>
                      <td className="py-2.5 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(b)}
                          className="inline-flex items-center px-3 py-1.5 rounded border border-sky-300 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded border border-red-300 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BeneficiariosPage;