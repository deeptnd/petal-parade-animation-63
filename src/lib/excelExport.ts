import * as XLSX from 'xlsx';

export interface FlowerEntry {
  id: number;
  roll_number: string;
  selected_petals: string[];
  created_at: string;
}

const FLOWER_PETALS = [
  { 
    id: "Upvaas", 
    name: "Upvaas", 
    color: "#881337", 
  },
  { 
    id: "Ahanik", 
    name: "Ahanik", 
    color: "#86198f", 
  },
  { 
    id: "Abhyas", 
    name: "Abhyas", 
    color: "#854d0e", 
  },
  { 
    id: "Mukhpath", 
    name: "Mukhpath", 
    color: "#1e40af", 
  },
  { 
    id: "Taap", 
    name: "Taap", 
    color: "#166534", 
  },
  { 
    id: "Swasthya", 
    name: "Swasthya", 
    color: "#0f766e", 
  },
  { 
    id: "SiddhantPushti", 
    name: "Siddhant Pushti", 
    color: "#7e22ce", 
  },
  { 
    id: "SatsangPrachar", 
    name: "Satsang Prachar", 
    color: "#9a3412", 
  },
];

export const exportToExcel = (entries: FlowerEntry[]) => {
  try {
    // Helper: check if date is today (local)
    const isToday = (isoString: string) => {
      const d = new Date(isoString);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    };

    // Only include today's entries
    const todaysEntries = entries.filter(e => isToday(e.created_at));

    // Build a list of roll numbers per petal, repeating for multiple counts
    const petalToRollNumbers: Record<string, string[]> = {};

    const numericSort = (a: string, b: string) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b, undefined, { numeric: true });
    };

    FLOWER_PETALS.forEach(petal => {
      const list: string[] = [];
      todaysEntries.forEach(entry => {
        if (Array.isArray(entry.selected_petals)) {
          const occurrences = entry.selected_petals.filter(id => id === petal.id).length;
          if (occurrences > 0) {
            for (let i = 0; i < occurrences; i++) {
              list.push(entry.roll_number);
            }
          }
        }
      });
      petalToRollNumbers[petal.name] = list.sort(numericSort);
    });

    // Determine number of rows by the longest petal list
    const maxRows = Math.max(
      0,
      ...Object.values(petalToRollNumbers).map(list => list.length)
    );

    // Create row-wise data where each column is a petal name
    const excelData: any[] = [];
    for (let i = 0; i < maxRows; i++) {
      const row: Record<string, string> = {};
      FLOWER_PETALS.forEach(petal => {
        const list = petalToRollNumbers[petal.name] || [];
        row[petal.name] = (list[i] ?? '-') as string;
      });
      excelData.push(row);
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for petal columns
    const columnWidths = [
      { wch: 15 }, // Upvaas
      { wch: 15 }, // Ahanik
      { wch: 15 }, // Abhyas
      { wch: 15 }, // Mukhpath
      { wch: 15 }, // Taap
      { wch: 15 }, // Swasthya
      { wch: 18 }, // Siddhant Pushti
      { wch: 18 }  // Satsang Prachar
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Today');

    // Generate filename with current date
    const now = new Date();
    const filename = `flower-entries-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, filename);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export Excel file');
  }
};