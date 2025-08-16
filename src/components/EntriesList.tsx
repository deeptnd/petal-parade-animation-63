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
  { id: "rose", name: "Rose", color: "hsl(345, 85%, 30%)" },
  { id: "tulip", name: "Tulip", color: "hsl(291, 64%, 42%)" },
  { id: "sunflower", name: "Sunflower", color: "hsl(60, 40%, 40%)" },
  { id: "lotus", name: "Lotus", color: "hsl(230, 70%, 30%)" },
  { id: "daisy", name: "Daisy", color: "hsl(120, 60%, 40%)" },
  { id: "orchid", name: "Orchid", color: "hsl(180, 50%, 35%)" },
  { id: "cherry", name: "Cherry", color: "hsl(270, 80%, 40%)" },
  { id: "lavender", name: "Lavender", color: "hsl(30, 100%, 30%)" },
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

  const getPetalColor = (petalId: string) => {
    return FLOWER_PETALS.find(p => p.id === petalId)?.color || 'hsl(var(--muted))'
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
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Roll Number: {entry.roll_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()} at{' '}
                      {new Date(entry.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm mb-2">Selected Petals:</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.selected_petals.map((petalId) => (
                      <div
                        key={petalId}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPetalColor(petalId) }}
                        />
                        {FLOWER_PETALS.find(p => p.id === petalId)?.name || petalId}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}