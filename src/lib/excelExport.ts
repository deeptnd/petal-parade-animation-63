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
    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      const date = new Date(entry.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, FlowerEntry[]>);

    // Prepare data for Excel with petals as columns
    const excelData = Object.keys(entriesByDate).map(date => {
      const dayEntries = entriesByDate[date];
      const row: any = { 'Date': date };
      
      // For each petal type, collect all roll numbers that selected it
      FLOWER_PETALS.forEach(petal => {
        const rollNumbers = dayEntries
          .filter(entry => entry.selected_petals.includes(petal.id))
          .map(entry => entry.roll_number);
        
        // Join roll numbers with line breaks, or show dash if none
        row[petal.name] = rollNumbers.length > 0 ? rollNumbers.join('\n') : '-';
      });
      
      return row;
    });

    // Sort by date
    excelData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for the new format
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // Upvaas
      { wch: 15 }, // Ahanik
      { wch: 15 }, // Abhyas
      { wch: 15 }, // Mukhpath
      { wch: 15 }, // Taap
      { wch: 15 }, // Swasthya
      { wch: 15 }, // Siddhant Pushti
      { wch: 15 }  // Satsang Prachar
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flower Entries');

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