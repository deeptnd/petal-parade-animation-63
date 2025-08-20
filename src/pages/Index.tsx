import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EntriesList } from "@/components/EntriesList";
import { Database } from "lucide-react";
import confetti from "canvas-confetti";
import Target from "@/assets/Target.svg";
import Abhyas from "@/assets/petals/Abhyas.png";
import Ahanik from "@/assets/petals/Ahanik.png";
import Mukhpath from "@/assets/petals/Mukhpath.png";
import SatsangPrachar from "@/assets/petals/Satsang Prachar.png";
import SiddhanPushti from "@/assets/petals/Siddhant Pushti.png";
import Taap from "@/assets/petals/Taap.png";
import Upvaas from "@/assets/petals/Upvaas.png";
import Swasthya from "@/assets/petals/Swasthya.png";
import pot1 from "@/assets/Kalash/upvaas.png";
import pot2 from "@/assets/Kalash/ahanik.png";
import pot3 from "@/assets/Kalash/abhyas.png";
import pot4 from "@/assets/Kalash/mukhpath.png";
import pot5 from "@/assets/Kalash/taap.png";
import pot6 from "@/assets/Kalash/swasthya.png";
import pot7 from "@/assets/Kalash/siddhant pushti.png";
import pot8 from "@/assets/Kalash/satsang prachar.png";

// Custom SVG Icons for petals
const UpvaasIcon = () => <img src={Upvaas} alt="upvaas" className="w-16 h-16" />;
const AhanikIcon = () => <img src={Ahanik} alt="ahanik" className="w-16 h-16" />;
const AbhyasIcon = () => <img src={Abhyas} alt="abhyas" className="w-16 h-16" />;
const MukhpathIcon = () => <img src={Mukhpath} alt="mukhpath" className="w-16 h-16" />;
const TaapIcon = () => <img src={Taap} alt="taap" className="w-16 h-16" />;
const SwasthyaIcon = () => <img src={Swasthya} alt="swasthya" className="w-16 h-16" />;
const SiddhantPushtiIcon = () => <img src={SiddhanPushti} alt="siddhant pushti" className="w-16 h-16" />;
const SatsangPracharIcon = () => <img src={SatsangPrachar} alt="satsang prachar" className="w-16 h-16" />;

// Custom SVG Pots for each flower - Increased size to w-20 h-20
const UpvaasPot = () => <img src={pot1} alt="upvaas" className="w-20 h-20 drop-shadow-lg" />;
const AhanikPot = () => <img src={pot2} alt="ahanik" className="w-20 h-20 drop-shadow-lg" />;
const AbhyasPot = () => <img src={pot3} alt="abhyas" className="w-20 h-20 drop-shadow-lg" />;
const MukhpathPot = () => <img src={pot4} alt="mukhpath" className="w-20 h-20 drop-shadow-lg" />;
const TaapPot = () => <img src={pot5} alt="taap" className="w-20 h-20 drop-shadow-lg" />;
const SwasthyaPot = () => <img src={pot6} alt="swasthya" className="w-20 h-20 drop-shadow-lg" />;
const SiddhantPushtiPot = () => <img src={pot7} alt="siddhant pushti" className="w-20 h-20 drop-shadow-lg" />;
const SatsangPracharPot = () => <img src={pot8} alt="satsang prachar" className="w-20 h-20 drop-shadow-lg" />;

interface FlowerPetal {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  pot: React.ReactNode;
}

const FLOWER_PETALS: FlowerPetal[] = [
  { 
    id: "Upvaas", 
    name: "Upvaas", 
    color: "#881337", 
    icon: <UpvaasIcon/>,
    pot: <UpvaasPot />
  },
  { 
    id: "Ahanik", 
    name: "Ahanik", 
    color: "#86198f", 
    icon: <AhanikIcon />,
    pot: <AhanikPot />
  },
  { 
    id: "Abhyas", 
    name: "Abhyas", 
    color: "#854d0e", 
    icon: <AbhyasIcon />,
    pot: <AbhyasPot />
  },
  { 
    id: "Mukhpath", 
    name: "Mukhpath", 
    color: "#1e40af", 
    icon: <MukhpathIcon />,
    pot: <MukhpathPot />
  },
  { 
    id: "Taap", 
    name: "Taap", 
    color: "#166534", 
    icon: <TaapIcon />,
    pot: <TaapPot />
  },
  { 
    id: "Swasthya", 
    name: "Swasthya", 
    color: "#0f766e", 
    icon: <SwasthyaIcon />,
    pot: <SwasthyaPot />
  },
  { 
    id: "SiddhantPushti", 
    name: "Siddhant Pushti", 
    color: "#7e22ce", 
    icon: <SiddhantPushtiIcon />,
    pot: <SiddhantPushtiPot />
  },
  { 
    id: "SatsangPrachar", 
    name: "Satsang Prachar", 
    color: "#9a3412", 
    icon: <SatsangPracharIcon />,
    pot: <SatsangPracharPot />
  },
];

const Index = () => {
  const [roll, setRoll] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [animating, setAnimating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [totalPetals, setTotalPetals] = useState(0);
  const potRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const optionImgRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { toast } = useToast();

  // Fetch total petals count from database
  useEffect(() => {
    const fetchTotalPetals = async () => {
      try {
        const { data, error } = await supabase
          .from('flower_entries')
          .select('selected_petals');

        if (error) throw error;

        const count = data.reduce((total, entry) => {
          return total + (entry.selected_petals?.length || 0);
        }, 18063);

        setTotalPetals(count);
      } catch (error) {
        console.error('Error fetching total petals:', error);
      }
    };

    fetchTotalPetals();
  }, []);

  const handleChecked = (id: string, value: boolean | "indeterminate") => {
    setSelected((prev) => ({ ...prev, [id]: value === true }));
  };

  // Calculate total selected petals for current user
  const currentSelected = Object.values(selected).filter(Boolean).length;

  const animateOne = async (id: string) => {
    const imgEl = optionImgRefs.current[id];
    const potEl = potRefs.current[id];
    if (!imgEl || !potEl) return;

    const startRect = imgEl.getBoundingClientRect();
    const endRect = potEl.getBoundingClientRect();

    const clone = imgEl.cloneNode(true) as HTMLDivElement;
    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "50";
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    clone.style.left = `${startX}px`;
    clone.style.top = `${startY}px`;
    clone.style.width = `28px`;
    clone.style.height = `28px`;
    clone.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(clone);

    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height * 0.2;

    const drift = Math.random() * 80 - 40;
    const rotate1 = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 20);
    const rotate2 = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 30);

    const keyframes: Keyframe[] = [
      { transform: `translate(-50%, -50%) translate(0px, 0px) rotate(0deg)`, opacity: 0 },
      { transform: `translate(-50%, -50%) translate(${(endX - startX) / 2 + drift}px, ${(endY - startY) / 2}px) rotate(${rotate1}deg)`, opacity: 1 },
      { transform: `translate(-50%, -50%) translate(${endX - startX}px, ${endY - startY}px) rotate(${rotate2}deg)`, opacity: 0.95 },
    ];

    const timing: KeyframeAnimationOptions = {
      duration: 950,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    };

    try {
      await (clone.animate(keyframes, timing) as Animation).finished;
    } catch (e) {
      // no-op
    }
    clone.remove();
    await new Promise((r) => setTimeout(r, 250));
  };

  const saveEntry = async (rollNumber: string, selectedPetals: string[]) => {
    try {
      const { error } = await supabase
        .from('flower_entries')
        .insert([
          {
            roll_number: rollNumber,
            selected_petals: selectedPetals,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // Update total petals count after successful submission
      setTotalPetals(prev => prev + selectedPetals.length);

      toast({
        title: "Entry Saved!",
        description: "Your flower arrangement has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (animating) return;
    
    if (!roll.trim()) {
      toast({ 
        title: "Roll number required", 
        description: "Please enter your roll number before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    const ids = FLOWER_PETALS.map((p) => p.id).filter((id) => selected[id]);
    if (ids.length === 0) {
      toast({ 
        title: "No petals selected", 
        description: "Please select at least one flower petal to animate.",
        variant: "destructive"
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmSubmission = async () => {
    setShowConfirmDialog(false);
    setAnimating(true);
    
    const ids = FLOWER_PETALS.map((p) => p.id).filter((id) => selected[id]);
    
    // Run all animations in parallel
    await Promise.all(ids.map(id => animateOne(id)));
    
    setAnimating(false);
    
    // Big confetti effect
    confetti({
      particleCount: 300,
      spread: 100,
      origin: { y: 0.6 },
      scalar: 1.5
    });
    
    // Additional smaller confetti
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 }
      });
    }, 300);
    
    // Save entry to database
    await saveEntry(roll, ids);
    
    // Reset form
    setSelected({});
    setRoll("");
    
    toast({ title: "Done!", description: "Your flower petals have reached their pot and been saved!" });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container mx-auto pt-10 pb-6 flex flex-col items-center">
        <img
          src={Target}
          width={820}
          className="max-w-full h-auto"
          alt="Flower Target"
        />
        <div className="mt-4 text-l font-medium  px-4 py-2 text-center">
          Total Pushp Offered: <br></br><span className="font-bold text-5xl text-blue-600">{totalPetals}</span>
        </div>
      </header>

      <main className="container mx-auto pb-44">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
          <div className="text-left">
            <Label htmlFor="roll" className="text-sm">Roll number</Label>
            <Input
              id="roll"
              placeholder="Enter roll number"
              inputMode="numeric"
              value={roll}
              onChange={(e) => setRoll(e.currentTarget.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium">Choose Pushp</p>
              <p className="text-sm text-muted-foreground">
                Your selection: <span className="font-bold">{currentSelected}</span>
              </p>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3 justify-items-center">
              {FLOWER_PETALS.map((petal) => (
                <label 
                  key={petal.id} 
                  htmlFor={petal.id} 
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Checkbox 
                    id={petal.id} 
                    checked={!!selected[petal.id]} 
                    onCheckedChange={(v) => handleChecked(petal.id, v)} 
                    className="sr-only" 
                  />
                  <div
                    ref={(el) => (optionImgRefs.current[petal.id] = el)}
                    className={`shrink-0 w-15 h-15 rounded-full transition-all duration-200 flex items-center justify-center ${
                      selected[petal.id] ? 'scale-110' : 'scale-100 opacity-40'
                    }`}
                    style={{
                      backgroundColor: selected[petal.id] ? `${petal.color}20` : 'hsl(var(--muted))',
                      borderColor: selected[petal.id] ? petal.color : 'hsl(var(--border))',
                    }}
                  >
                    {petal.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{petal.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={animating || currentSelected === 0} 
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {animating ? "Submitting..." : `Submit ${currentSelected > 0 ? `(${currentSelected})` : ''}`}
            </Button>
          </div>
        </form>
      </main>

      {/* Fixed individual pots at the bottom */}
       <div className="fixed inset-x-0 bottom-4 sm:bottom-6 pointer-events-none">
        <div className="container mx-auto">
          <div className="mx-auto w-full max-w-4xl">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 justify-items-center">
              {FLOWER_PETALS.map((petal) => (
                <div key={petal.id} className="flex flex-col items-center gap-1">
                  <div ref={(el) => (potRefs.current[petal.id] = el)}>
                    {petal.pot}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              You have selected {currentSelected} pushp. Are you sure you want to submit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmSubmission}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden admin button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="fixed bottom-2 right-2 opacity-20 hover:opacity-100 transition-opacity"
          >
            <Database size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>All Entries</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <EntriesList />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;