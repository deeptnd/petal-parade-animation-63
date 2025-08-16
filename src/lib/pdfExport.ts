import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
export interface FlowerEntry {
  id?: number
  roll_number: string
  selected_petals: string[]
  created_at?: string
}

export const exportToPDF = (entries: FlowerEntry[]) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text('Flower Petal Entries', 14, 22)
  
  // Prepare data for table
  const tableData = entries.map(entry => [
    entry.roll_number,
    entry.selected_petals.join(', '),
    new Date(entry.created_at!).toLocaleDateString()
  ])
  
  // Add table
  autoTable(doc, {
    head: [['Roll Number', 'Selected Petals', 'Date']],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 12,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [64, 64, 64],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })
  
  // Save the PDF
  doc.save('flower-petal-entries.pdf')
}