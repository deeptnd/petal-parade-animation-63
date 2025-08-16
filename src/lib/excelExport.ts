import * as XLSX from 'xlsx';

export interface FlowerEntry {
  id: number;
  roll_number: string;
  selected_petals: string[];
  created_at: string;
}

const FLOWER_PETALS = [
  { id: "rose", name: "Rose", color: "hsl(345, 85%, 30%)" },
  { id: "tulip", name: "Tulip", color: "hsl(291, 64%, 42%)" },
  { id: "sunflower", name: "Sunflower", color: "hsl(60, 40%, 40%)" },
  { id: "lotus", name: "Lotus", color: "hsl(230, 70%, 30%)" },
  { id: "daisy", name: "Daisy", color: "hsl(120, 60%, 40%)" },
  { id: "orchid", name: "Orchid", color: "hsl(180, 50%, 35%)" },
  { id: "cherry", name: "Cherry", color: "hsl(270, 80%, 40%)" },
  { id: "lavender", name: "Lavender", color: "hsl(30, 100%, 30%)" },
];

export const exportToExcel = (entries: FlowerEntry[]) => {
  try {
    // Prepare data for Excel
    const excelData = entries.map(entry => {
      const selectedPetalNames = entry.selected_petals
        .map(petalId => {
          const petal = FLOWER_PETALS.find(p => p.id === petalId);
          return petal ? petal.name : petalId;
        })
        .join(', ');

      return {
        'Roll Number': entry.roll_number,
        'Selected Petals': selectedPetalNames,
        'Created At': new Date(entry.created_at).toLocaleString(),
        'Entry ID': entry.id
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Roll Number
      { wch: 30 }, // Selected Petals
      { wch: 20 }, // Created At
      { wch: 10 }  // Entry ID
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