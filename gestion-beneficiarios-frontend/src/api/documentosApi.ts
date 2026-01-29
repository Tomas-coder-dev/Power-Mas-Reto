import type { DocumentoIdentidad } from "../models/DocumentoIdentidad";

// URL del backend .NET
const BASE_URL = "https://localhost:7263/api";

export async function fetchDocumentosIdentidad(): Promise<DocumentoIdentidad[]> {
  const res = await fetch(`${BASE_URL}/DocumentosIdentidad`);
  if (!res.ok) {
    throw new Error("No se pudo cargar la lista de documentos");
  }
  return res.json();
}