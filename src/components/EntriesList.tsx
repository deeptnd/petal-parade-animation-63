import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { exportToExcel } from '@/lib/excelExport'
import { useToast } from '@/hooks/use-toast'
import { Download, Flower } from 'lucide-react'

interface FlowerEntry {
  id: number
  roll_number: string
  selected_petals: string[]
  created_at: string
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
]

export const EntriesList = () => {
  const [entries, setEntries] = useState<FlowerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('flower_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast({
        title: "Error",
        description: "Failed to fetch entries. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleExportExcel = async () => {
    if (entries.length === 0) {
      toast({
        title: "No entries",
        description: "There are no entries to export.",
        variant: "destructive"
      })
      return
    }
    
    try {
      await exportToExcel(entries)
      toast({
        title: "Success",
        description: "Excel file exported successfully!"
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the Excel file.",
        variant: "destructive"
      })
    }
  }

  // Group entries by date
  const groupEntriesByDate = () => {
    const grouped: Record<string, FlowerEntry[]> = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(entry)
    })
    
    return grouped
  }

  // Get all roll numbers that selected a specific petal on a specific date
  const getRollNumbersForPetal = (dateEntries: FlowerEntry[], petalId: string) => {
    const rollNumbers = new Set<string>()
    
    dateEntries.forEach(entry => {
      if (entry.selected_petals.includes(petalId)) {
        rollNumbers.add(entry.roll_number)
      }
    })
    
    return Array.from(rollNumbers).sort()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flower className="w-5 h-5" />
            All Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading entries...</p>
        </CardContent>
      </Card>
    )
  }

  const groupedEntries = groupEntriesByDate()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Flower className="w-5 h-5" />
          All Entries ({entries.length})
        </CardTitle>
        <Button onClick={handleExportExcel} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No entries yet. Submit your first flower arrangement!
          </p>
        ) : (
          <div className="overflow-x-auto">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <div key={date} className="mb-8">
                <h3 className="text-lg font-bold mb-2">{date}</h3>
                <table className="w-full border-collapse border mb-4">
                  <thead>
                    <tr className="bg-muted">
                      {FLOWER_PETALS.map(petal => (
                        <th key={petal.id} className="border p-2 text-center">{petal.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {FLOWER_PETALS.map(petal => {
                        const rollNumbers = getRollNumbersForPetal(dateEntries, petal.id)
                        return (
                          <td key={petal.id} className="border p-2 text-center">
                            {rollNumbers.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {rollNumbers.map(rollNumber => (
                                  <div key={rollNumber} className="font-medium">
                                    {rollNumber}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}