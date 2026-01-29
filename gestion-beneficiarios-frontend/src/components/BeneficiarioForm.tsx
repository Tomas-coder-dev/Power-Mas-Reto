import React, { useEffect, useState } from "react";
import type { DocumentoIdentidad } from "../models/DocumentoIdentidad";
import type { Beneficiario } from "../models/Beneficiario";
import {
  createBeneficiario,
  updateBeneficiario,
} from "../api/beneficiariosApi";

interface Props {
  documentos: DocumentoIdentidad[];
  onSaved: () => void;
  beneficiarioEdit?: Beneficiario | null;
  onCancelEdit?: () => void;
}

type Sexo = "M" | "F";

const BeneficiarioForm: React.FC<Props> = ({
  documentos,
  onSaved,
  beneficiarioEdit,
  onCancelEdit,
}) => {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [documentoId, setDocumentoId] = useState<number | "">("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [sexo, setSexo] = useState<Sexo | "">("");
  const [errorDoc, setErrorDoc] = useState<string | null>(null);

  const selectedDocumento = documentos.find((d) => d.id === Number(documentoId));

  const feedbackFormato =
    selectedDocumento != null
      ? `Debe tener exactamente ${selectedDocumento.longitud} caracteres${
          selectedDocumento.soloNumeros
            ? " y solo números."
            : " (puede incluir letras y/o números)."
        }`
      : "";

  useEffect(() => {
    if (beneficiarioEdit) {
      setNombres(beneficiarioEdit.nombres);
      setApellidos(beneficiarioEdit.apellidos);
      setDocumentoId(beneficiarioEdit.documentoIdentidadId);
      setNumeroDocumento(beneficiarioEdit.numeroDocumento);
      setFechaNacimiento(beneficiarioEdit.fechaNacimiento.substring(0, 10));
      setSexo(beneficiarioEdit.sexo);
      setErrorDoc(null);
    } else {
      limpiarFormulario();
    }
  }, [beneficiarioEdit]);

  const limpiarFormulario = () => {
    setNombres("");
    setApellidos("");
    setDocumentoId("");
    setNumeroDocumento("");
    setFechaNacimiento("");
    setSexo("");
    setErrorDoc(null);
  };

  const limpiarNumeroYErrores = () => {
    setNumeroDocumento("");
    setErrorDoc(null);
  };

  const validateNumeroDocumento = (value: string): boolean => {
    if (!selectedDocumento) return true;

    if (value.length !== selectedDocumento.longitud) {
      setErrorDoc(`La longitud debe ser ${selectedDocumento.longitud} caracteres.`);
      return false;
    }

    if (selectedDocumento.soloNumeros && !/^\d+$/.test(value)) {
      setErrorDoc("Solo se permiten dígitos para este tipo de documento.");
      return false;
    }

    setErrorDoc(null);
    return true;
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (selectedDocumento?.soloNumeros) {
      value = value.replace(/\D/g, "");
    }
    setNumeroDocumento(value);
    if (value) validateNumeroDocumento(value);
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : "";
    setDocumentoId(value);
    limpiarNumeroYErrores();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!documentoId || !selectedDocumento) {
      window.alert("Seleccione un tipo de documento");
      return;
    }
    const ok = validateNumeroDocumento(numeroDocumento);
    if (!ok) return;

    const payload = {
      nombres,
      apellidos,
      documentoIdentidadId: Number(documentoId),
      numeroDocumento,
      fechaNacimiento,
      sexo: sexo as Sexo,
    };

    try {
      if (beneficiarioEdit) {
        await updateBeneficiario(beneficiarioEdit.id, {
          ...payload,
          id: beneficiarioEdit.id,
        });
      } else {
        await createBeneficiario(payload);
      }
      onSaved();
      limpiarFormulario();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error desconocido al guardar";
      window.alert(msg);
    }
  };

  const inputClass =
    "shadow-sm border rounded-md w-full py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

  const isEditing = !!beneficiarioEdit;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow rounded-lg px-6 md:px-8 pt-6 pb-6 md:pb-8 mb-4 space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-slate-800">
          {isEditing ? "Editar Beneficiario" : "Registrar Beneficiario"}
        </h2>
        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={() => {
              limpiarFormulario();
              onCancelEdit();
            }}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Cancelar edición
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">
            Nombres
          </label>
          <input
            className={inputClass}
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            required
            placeholder="Ej. Juan Carlos"
          />
        </div>

        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">
            Apellidos
          </label>
          <input
            className={inputClass}
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
            placeholder="Ej. Pérez López"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">
            Tipo de documento
          </label>
          <select
            className={inputClass}
            value={documentoId}
            onChange={handleDocumentoChange}
            required
          >
            <option value="">Seleccione...</option>
            {documentos.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.abreviatura} - {doc.nombre} ({doc.pais})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-700 text-sm font-medium mb-1">
            Número de documento
          </label>
          <input
            className={`${inputClass} ${
              errorDoc ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""
            }`}
            value={numeroDocumento}
            onChange={handleNumeroChange}
            required
            placeholder="Ingrese el número según el tipo seleccionado"
          />
          {feedbackFormato && (
            <p className="text-xs text-slate-500 mt-1">{feedbackFormato}</p>
          )}
          {errorDoc && <p className="text-xs text-red-500 mt-1">{errorDoc}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            className={inputClass}
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1">
            Sexo
          </label>
          <select
            className={inputClass}
            value={sexo}
            onChange={(e) => setSexo(e.target.value as Sexo | "")}
            required
          >
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2 space-x-2">
        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={() => {
              limpiarFormulario();
              onCancelEdit();
            }}
            className="inline-flex items-center px-4 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 shadow-sm"
        >
          {isEditing ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default BeneficiarioForm;