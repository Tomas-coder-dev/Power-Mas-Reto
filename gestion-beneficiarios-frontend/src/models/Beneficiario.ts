export interface Beneficiario {
  id: number;
  nombres: string;
  apellidos: string;
  documentoIdentidadId: number;
  nombreDocumento?: string;
  abreviatura?: string;
  numeroDocumento: string;
  fechaNacimiento: string; 
  sexo: "M" | "F";
}