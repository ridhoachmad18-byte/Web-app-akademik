export interface Student {
  id: string;
  name: string;
  username: string;
  password: string;
  grade: string; // e.g. "Kelas 1A", "Kelas 2B"
  birthDate?: string; // Tanggal lahir format YYYY-MM-DD (e.g. 2017-05-12)
  nik?: string;  // Nomor Induk Kependudukan (16 digit)
  nis?: string;  // Nomor Induk Siswa / NISN
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SchoolConfig {
  schoolName: string;
  academicAppUrl: string;
  academicYear: string;
  semester: string;
  logoUrl?: string;
}
