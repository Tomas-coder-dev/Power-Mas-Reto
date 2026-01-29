import type { Beneficiario } from "../models/Beneficiario";

const BASE_URL = "https://localhost:7263/api";

export async function fetchBeneficiarios(): Promise<Beneficiario[]> {
  const res = await fetch(`${BASE_URL}/Beneficiarios`);
  if (!res.ok) {
    throw new Error("Error al obtener beneficiarios");
  }
  return res.json();
}

type SaveBeneficiarioRequest = {
  nombres: string;
  apellidos: string;
  documentoIdentidadId: number;
  numeroDocumento: string;
  fechaNacimiento: string;
  sexo: "M" | "F";
};

export async function createBeneficiario(
  data: SaveBeneficiarioRequest
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Beneficiarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear beneficiario");
  }
}

export async function updateBeneficiario(
  id: number,
  data: SaveBeneficiarioRequest
): Promise<void> {
  const res = await fetch(`${BASE_URL}/Beneficiarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al actualizar beneficiario");
  }
}

export async function deleteBeneficiario(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/Beneficiarios/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al eliminar beneficiario");
  }
}