export interface Beneficiario {
  id: number;
  nombres: string;
  apellidos: string;
  documentoIdentidadId: number;
  nombreDocumento?: string;
  abreviatura?: string;
  numeroDocumento: string;
  fechaNacimiento: string; // ISO ej. "1990-01-01"
  sexo: "M" | "F";
}