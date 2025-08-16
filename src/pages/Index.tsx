import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EntriesList } from "@/components/EntriesList";
import { Database } from "lucide-react";
import confetti from "canvas-confetti";

import PotImg from "@/assets/pot.png";

interface FlowerPetal {
  id: string;
  name: string;
  color: string;
}

const FLOWER_PETALS: FlowerPetal[] = [
  { id: "rose", name: "Rose", color: "hsl(345, 85%, 30%)" },
  { id: "tulip", name: "Tulip", color: "hsl(291, 64%, 42%)" },
  { id: "sunflower", name: "Sunflower", color: "hsl(60, 40%, 40%)" },
  { id: "lotus", name: "Lotus", color: "hsl(230, 70%, 30%)" },
  { id: "daisy", name: "Daisy", color: "hsl(120, 60%, 40%)" },
  { id: "orchid", name: "Orchid", color: "hsl(180, 50%, 35%)" },
  { id: "cherry", name: "Cherry", color: "hsl(270, 80%, 40%)" },
  { id: "lavender", name: "Lavender", color: "hsl(30, 100%, 30%)" },
];

const Index = () => {
  const [roll, setRoll] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [animating, setAnimating] = useState(false);
  const potRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const optionImgRefs = useRef<Record<string, HTMLElement | null>>({});
  const { toast } = useToast();

  const handleChecked = (id: string, value: boolean | "indeterminate") => {
    setSelected((prev) => ({ ...prev, [id]: value === true }));
  };

  const animateOne = async (id: string) => {
    const imgEl = optionImgRefs.current[id];
    const potEl = potRefs.current[id];
    if (!imgEl || !potEl) return;

    const startRect = imgEl.getBoundingClientRect();
    const endRect = potEl.getBoundingClientRect();

    const clone = imgEl.cloneNode(true) as HTMLElement;
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
    const endY = endRect.top + endRect.height * 0.2; // a bit above the pot rim

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

  const onSubmit = async (e: React.FormEvent) => {
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
    
    setAnimating(true);
    
    // Run all animations in parallel
    await Promise.all(ids.map(id => animateOne(id)));
    
    setAnimating(false);
    
    // Trigger confetti after animations complete
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Save entry to database
    await saveEntry(roll, ids);
    
    // Reset form
    setSelected({});
    setRoll("");
    
    toast({ title: "Done!", description: "Your flower petals have reached their pot and been saved!" });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container mx-auto pt-10 pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">Flower Petal Animator</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto animate-fade-in">
          Enter your roll number, pick flower petals, and watch them float into the pot with beautiful animations.
        </p>
      </header>

      <main className="container mx-auto pb-44">
        <form onSubmit={onSubmit} className="space-y-6 max-w-3xl mx-auto">
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
            <p className="mb-3 font-medium">Choose flower petals</p>
            <div className="flex flex-wrap justify-center gap-4">
              {FLOWER_PETALS.map((petal, index) => (
                <label key={petal.id} htmlFor={petal.id} className="flex items-center justify-center hover-scale cursor-pointer">
                  <Checkbox id={petal.id} checked={!!selected[petal.id]} onCheckedChange={(v) => handleChecked(petal.id, v)} className="sr-only" />
                  <div
                    ref={(el) => (optionImgRefs.current[petal.id] = el)}
                    className="shrink-0 w-12 h-12 rounded-full transition-all duration-200 border-2"
                    style={{
                      backgroundColor: selected[petal.id] ? petal.color : 'hsl(var(--muted))',
                      borderColor: selected[petal.id] ? petal.color : 'hsl(var(--border))',
                      opacity: selected[petal.id] ? 1 : 0.4,
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={animating} className="w-full md:w-auto">
              {animating ? "Animating..." : "Submit"}
            </Button>
          </div>
        </form>
      </main>

      {/* Fixed individual pots at the bottom */}
      <div className="fixed inset-x-0 bottom-2 sm:bottom-4 pointer-events-none">
        <div className="container mx-auto">
          <div className="mx-auto w-full max-w-3xl">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3 justify-items-center">
              {FLOWER_PETALS.map((petal) => (
                <div key={petal.id} className="flex flex-col items-center gap-1">
                  <img
                    ref={(el) => (potRefs.current[petal.id] = el)}
                    src={PotImg}
                    alt={`${petal.name} pot`}
                    loading="eager"
                    width={56}
                    height={56}
                    className="drop-shadow-lg"
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{petal.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
