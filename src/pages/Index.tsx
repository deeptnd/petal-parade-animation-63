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
import { Database, Plus, Minus } from "lucide-react";
import confetti from "canvas-confetti";
import Target from "@/assets/Target.svg";
import Abhyas from "@/assets/petals/Abhyas.png";
import Ahanik from "@/assets/petals/Ahanik.png";
import SatsangPrachar from "@/assets/petals/Satsang Prachar.png";
import SiddhanPushti from "@/assets/petals/Siddhant Pushti.png";
import Taap from "@/assets/petals/Taap.png";
import Upvaas from "@/assets/petals/Upvaas.png";
import Swasthya from "@/assets/petals/Swasthya.png";
import pot1 from "@/assets/Kalash/upvaas.png";
import pot2 from "@/assets/Kalash/ahanik.png";
import pot3 from "@/assets/Kalash/abhyas.png";
import pot5 from "@/assets/Kalash/taap.png";
import pot6 from "@/assets/Kalash/swasthya.png";
import pot7 from "@/assets/Kalash/siddhant pushti.png";
import pot8 from "@/assets/Kalash/satsang prachar.png";

// Custom SVG Icons for petals
const UpvaasIcon = () => <img src={Upvaas} alt="upvaas" className="w-12 h-12 md:w-16 md:h-16" />;
const AhanikIcon = () => <img src={Ahanik} alt="ahanik" className="w-12 h-12 md:w-16 md:h-16" />;
const AbhyasIcon = () => <img src={Abhyas} alt="abhyas" className="w-12 h-12 md:w-16 md:h-16" />;
const TaapIcon = () => <img src={Taap} alt="taap" className="w-12 h-12 md:w-16 md:h-16" />;
const SwasthyaIcon = () => <img src={Swasthya} alt="swasthya" className="w-12 h-12 md:w-16 md:h-16" />;
const SiddhantPushtiIcon = () => <img src={SiddhanPushti} alt="siddhant pushti" className="w-12 h-12 md:w-16 md:h-16" />;
const SatsangPracharIcon = () => <img src={SatsangPrachar} alt="satsang prachar" className="w-12 h-12 md:w-16 md:h-16" />;

// Custom SVG Pots for each flower - Responsive size
const UpvaasPot = () => <img src={pot1} alt="upvaas" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />;
const AhanikPot = () => <img src={pot2} alt="ahanik" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />;
const AbhyasPot = () => <img src={pot3} alt="abhyas" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />;
const TaapPot = () => <img src={pot5} alt="taap" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />;
const SwasthyaPot = () => <img src={pot6} alt="swasthya" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />;
const SiddhantPushtiPot = () => <img src={pot7} alt="siddhant pushti" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />;
const SatsangPracharPot = () => <img src={pot8} alt="satsang prachar" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />;

interface FlowerPetal {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  pot: React.ReactNode;
  maxCount?: number;
  allowInput?: boolean;
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
    id: "Taap", 
    name: "Taap", 
    color: "#166534", 
    icon: <TaapIcon />,
    pot: <TaapPot />,
    maxCount: 4
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
    pot: <SiddhantPushtiPot />,
    maxCount: 3
  },
  { 
    id: "SatsangPrachar", 
    name: "Satsang Prachar", 
    color: "#9a3412", 
    icon: <SatsangPracharIcon />,
    pot: <SatsangPracharPot />,
    allowInput: true
  },
];

const Index = () => {
  const [roll, setRoll] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean | number>>({});
  const [petalCounts, setPetalCounts] = useState<Record<string, number>>({});
  const [animating, setAnimating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [totalPetals, setTotalPetals] = useState(0);
  const baseline = 100614;
  const [windowStart, setWindowStart] = useState<string>(""); // legacy
  const [windowEnd, setWindowEnd] = useState<string>("");   // legacy
  const [startTime, setStartTime] = useState<string>("");     // HH:MM
  const [endTime, setEndTime] = useState<string>("");         // HH:MM
  const [isWithinWindow, setIsWithinWindow] = useState<boolean>(true);
  const [enforceWindow, setEnforceWindow] = useState<boolean>(true);
  const [userEnabled, setUserEnabled] = useState<boolean>(true);
  const [manualOffset, setManualOffset] = useState<number>(0);
  const [petalInputs, setPetalInputs] = useState<Record<string, string>>({});
  const potRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const optionImgRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastSubmissionRef = useRef<{ roll: string; count: number; at: number } | null>(null);
  const lastBumpAtRef = useRef<number>(0);
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
        }, 0);

        setTotalPetals(count);
      } catch (error) {
        console.error('Error fetching total pushp:', error);
      }
    };

    fetchTotalPetals();
  }, []);

  // Periodically refresh total petals to keep all tabs in sync
  useEffect(() => {
    let isActive = true;
    const refresh = async () => { 
      try {
        const { data, error } = await supabase
          .from('flower_entries')
          .select('selected_petals');
        if (error) throw error;
        if (!isActive) return;
        const count = data.reduce((total, entry) => total + (entry.selected_petals?.length || 0), 0);
        const now = Date.now();
        const msSinceBump = now - (lastBumpAtRef.current || 0);
        setTotalPetals((prev) => {
          // For 5s after a local bump, avoid decreasing due to lag; afterward, trust server
          // Always update if server count is higher (new entries from other users)
          if (msSinceBump <= 5000) {
            return Math.max(prev, count);
          }
          return count;
        });
      } catch {}
    };
    const id = setInterval(refresh, 1000);
    const onVis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      isActive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Load app settings
  useEffect(() => {
    // Fetch global app settings for time window
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 'global')
          .maybeSingle();
        if (error) throw error;
        if (data) {
          const d: any = data as any;
          setWindowStart(d.window_start ?? "");
          setWindowEnd(d.window_end ?? "");
          setStartTime(d.start_time ?? "");
          setEndTime(d.end_time ?? "");
          setEnforceWindow(Boolean(d.enforce_window ?? true));
          setUserEnabled(Boolean(d.user_enabled ?? true));
          setManualOffset(Number(d.manual_offset ?? 0));
        }
      } catch (err) {
        console.error('Error fetching app settings:', err);
      }
    };
    fetchSettings();
    const id = setInterval(fetchSettings, 1000);
    const onVis = () => { if (document.visibilityState === 'visible') fetchSettings(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // no baseline persistence

  // Subscribe to global app settings changes
  useEffect(() => {
    const channel = supabase
      .channel('app_settings_changes_user')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: 'id=eq.global' },
        (payload) => {
          const row = (payload.new as any) ?? (payload.old as any);
          if (!row) return;
          setWindowStart(row.window_start ?? "");
          setWindowEnd(row.window_end ?? "");
          setStartTime(row.start_time ?? "");
          setEndTime(row.end_time ?? "");
          setEnforceWindow(Boolean(row.enforce_window ?? true));
          setUserEnabled(Boolean(row.user_enabled ?? true));
          setManualOffset(Number(row.manual_offset ?? 0));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Listen for admin broadcast updates (manual offset etc.)
  useEffect(() => {
    const bc = supabase
      .channel('app_settings_bc')
      .on('broadcast', { event: 'settings_update' }, (payload) => {
        try {
          const p: any = (payload as any).payload;
          if (typeof p?.manual_offset === 'number') {
            setManualOffset(Math.max(0, Math.floor(p.manual_offset)));
          }
        } catch {}
      })
      .on('broadcast', { event: 'maintenance' }, async () => {
        // On maintenance, force immediate resync from server
        try {
          const { data, error } = await supabase
            .from('flower_entries')
            .select('selected_petals');
          if (!error && data) {
            const count = data.reduce((t, e) => t + (e.selected_petals?.length || 0), 0);
            setTotalPetals(count);
          }
        } catch {}
        try {
          const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .eq('id', 'global')
            .maybeSingle();
          if (!error && data) {
            const d: any = data as any;
            setManualOffset(Number(d.manual_offset ?? 0));
          }
        } catch {}
      })
      .subscribe();
    return () => {
      supabase.removeChannel(bc);
    };
  }, []);

  // Compute whether current time is within window; supports legacy datetime and daily HH:MM; default open if not enforced
  useEffect(() => {
    const compute = () => {
      // If admin disables user page entirely, treat as closed
      if (!userEnabled) {
        setIsWithinWindow(false);
        return;
      }
      // Time restriction disabled: always open
      setIsWithinWindow(true);
      return;
      const now = new Date();
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const parseHM = (s: string) => {
        const [hh, mm] = s.split(":").map((v) => parseInt(v || '0', 10));
        if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
        return hh * 60 + mm;
      };
      const st = startTime ? parseHM(startTime) : null;
      const et = endTime ? parseHM(endTime) : null;
      const hasDaily = st !== null || et !== null;
      const hasLegacy = Boolean(windowStart) || Boolean(windowEnd);
      if (!hasDaily && !hasLegacy) {
        // Enforcement on but no window configured => closed
        setIsWithinWindow(false);
        return;
      }
      let timeOk = true;
      if (st !== null && et !== null) {
        if (st <= et) {
          timeOk = minutesNow >= st && minutesNow <= et;
        } else {
          // window spans midnight
          timeOk = minutesNow >= st || minutesNow <= et;
        }
      } else if (st !== null) {
        timeOk = minutesNow >= st;
      } else if (et !== null) {
        timeOk = minutesNow <= et;
      }
      if (hasDaily) {
        setIsWithinWindow(timeOk);
      } else {
        const legacyStartOk = windowStart ? Date.now() >= new Date(windowStart).getTime() : true;
        const legacyEndOk = windowEnd ? Date.now() <= new Date(windowEnd).getTime() : true;
        setIsWithinWindow(legacyStartOk && legacyEndOk);
      }
    };
    compute();
    const id = setInterval(compute, 1_000);
    const onVis = () => compute();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [windowStart, windowEnd, startTime, endTime, enforceWindow, userEnabled]);

  // Subscribe to realtime changes to keep total in sync across clients
  useEffect(() => {
    const channel = supabase
      .channel('flower_entries_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flower_entries' },
        (payload) => {
          const et = (payload as any).eventType as string | undefined;
          const rowNew: any = (payload as any).new;
          const rowOld: any = (payload as any).old;
          if (et === 'INSERT') {
            const added = rowNew?.selected_petals?.length || 0;
            const rn = rowNew?.roll_number as string | undefined;
            const ls = lastSubmissionRef.current;
            if (
              ls && rn && rn === ls.roll && added === ls.count && (Date.now() - ls.at) < 5000
            ) {
              lastSubmissionRef.current = null;
              return;
            }
            lastBumpAtRef.current = Date.now();
            setTotalPetals((prev) => prev + added);
          } else if (et === 'DELETE') {
            const removed = rowOld?.selected_petals?.length || 0;
            // Deletion likely due to maintenance; allow normal polling to reconcile down
            setTotalPetals((prev) => Math.max(0, prev - removed));
          } else if (et === 'UPDATE') {
            const before = rowOld?.selected_petals?.length || 0;
            const after = rowNew?.selected_petals?.length || 0;
            const delta = after - before;
            if (delta !== 0) {
              if (delta > 0) lastBumpAtRef.current = Date.now();
              setTotalPetals((prev) => Math.max(0, prev + delta));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleChecked = (id: string, value: boolean | "indeterminate") => {
    if (!isWithinWindow) return;
    const petal = FLOWER_PETALS.find(p => p.id === id);
    if (!petal) return;
    
    if (value === true) {
      setSelected(prev => ({ ...prev, [id]: true }));
      // Set default count to 1 for petals with maxCount
      if (petal.maxCount || petal.allowInput) {
        setPetalCounts(prev => ({ ...prev, [id]: 1 }));
        if (petal.allowInput) {
          setPetalInputs(prev => ({ ...prev, [id]: '1' }));
        }
      }
    } else {
      setSelected(prev => ({ ...prev, [id]: false }));
      // Remove count when deselected
      if (petal.maxCount || petal.allowInput) {
        setPetalCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[id];
          return newCounts;
        });
        if (petal.allowInput) {
          setPetalInputs(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      }
    }
  };

  const handleCountChange = (id: string, newCount: number) => {
    if (!isWithinWindow) return;
    const petal = FLOWER_PETALS.find(p => p.id === id);
    if (!petal || !petal.maxCount) return;
    
    // Ensure count is within limits
    newCount = Math.max(1, Math.min(petal.maxCount, newCount));
    setPetalCounts(prev => ({ ...prev, [id]: newCount }));
  };

  const handleInputCountChange = (id: string, value: string) => {
    if (!isWithinWindow) return;
    const petal = FLOWER_PETALS.find(p => p.id === id);
    if (!petal || !petal.maxCount) return;
    
    const numValue = parseInt(value) || 0;
    if (numValue >= 1 && numValue <= petal.maxCount) {
      setPetalCounts(prev => ({ ...prev, [id]: numValue }));
    }
  };

  const handleFreeInputChange = (id: string, value: string) => {
    if (!isWithinWindow) return;
    // Allow empty for clearing before retyping
    setPetalInputs(prev => ({ ...prev, [id]: value }));
    const parsed = parseInt(value, 10);
    const count = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    setPetalCounts(prev => ({ ...prev, [id]: count }));
  };

  // Calculate total selected petals for current user
  const currentSelected = Object.entries(selected)
    .filter(([_, isSelected]) => isSelected)
    .reduce((total, [id]) => {
      const count = petalCounts[id];
      return total + (typeof count === 'number' ? Math.max(0, count) : 1);
    }, 0);

  const animateOne = async (id: string, count: number = 1) => {
    const imgEl = optionImgRefs.current[id];
    const potEl = potRefs.current[id];
    if (!imgEl || !potEl) return;

    // Create an array of animation promises for all count
    const animationPromises = [];
    
    for (let i = 0; i < count; i++) {
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
      clone.style.width = "28px";
      clone.style.height = "28px";
      clone.style.transform = "translate(-50%, -50%)";
      document.body.appendChild(clone);

      const endX = endRect.left + endRect.width / 2;
      const endY = endRect.top + endRect.height * 0.2;

      const drift = Math.random() * 80 - 40;
      const rotate1 = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 20);
      const rotate2 = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 30);

      const keyframes: Keyframe[] = [
        { transform: 'translate(-50%, -50%) translate(0px, 0px) rotate(0deg)', opacity: 0 },
        { transform: `translate(-50%, -50%) translate(${(endX - startX) / 2 + drift}px, ${(endY - startY) / 2}px) rotate(${rotate1}deg)`, opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${endX - startX}px, ${endY - startY}px) rotate(${rotate2}deg)`, opacity: 0.95 },
      ];

      const timing: KeyframeAnimationOptions = {
        duration: 950,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      };

      // Create animation promise for this specific petal instance
      const animationPromise = clone.animate(keyframes, timing).finished
        .then(() => {
          clone.remove();
        })
        .catch(() => {
          // If animation fails, still remove the clone
          clone.remove();
        });
      
      animationPromises.push(animationPromise);
    }
    
    // Wait for all animations of this petal type to complete
    return Promise.all(animationPromises);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (animating || !isWithinWindow) return;
    
    if (!roll.trim()) {
      toast({ 
        title: "Roll number required", 
        description: "Please enter your roll number before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Create array of selected petals with proper counts
    const selectedPetals: string[] = [];
    Object.entries(selected).forEach(([id, isSelected]) => {
      if (isSelected) {
        const count = petalCounts[id] || 1;
        for (let i = 0; i < count; i++) {
          selectedPetals.push(id);
        }
      }
    });
    
    if (selectedPetals.length === 0) {
      toast({ 
        title: "No pushp selected", 
        description: "Please select at least one  pushp to animate.",
        variant: "destructive"
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmSubmission = async () => {
    setShowConfirmDialog(false);
    setAnimating(true);
    
    // Create array of selected petals with proper counts
    const selectedPetals: string[] = [];
    Object.entries(selected).forEach(([id, isSelected]) => {
      if (isSelected) {
        const count = petalCounts[id] || 1;
        for (let i = 0; i < count; i++) {
          selectedPetals.push(id);
        }
      }
    });
    
    // Run all animations in parallel
    const animationPromises = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => animateOne(id, petalCounts[id] || 1));
    
    await Promise.all(animationPromises);
    
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
    await saveEntry(roll, selectedPetals);
    // Optimistic increment; realtime will reconcile
    lastSubmissionRef.current = { roll, count: selectedPetals.length, at: Date.now() };
    lastBumpAtRef.current = Date.now();
    setTotalPetals((prev) => prev + selectedPetals.length);
    // Defensive: re-fetch total after a short delay to ensure DB has committed
    setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('flower_entries')
          .select('selected_petals');
        if (!error && data) {
          const count = data.reduce((total, entry) => total + (entry.selected_petals?.length || 0), 0);
          const now = Date.now();
          const msSinceBump = now - (lastBumpAtRef.current || 0);
          setTotalPetals((prev) => {
            // Always update if server count is higher
            if (msSinceBump <= 5000) {
              return Math.max(prev, count);
            }
            return count;
          });
        }
      } catch {}
    }, 500);
    
    // Reset form
    setSelected({});
    setPetalCounts({});
    setRoll("");
    
    toast({ title: "Done!", description: "पुष्प अर्पणम!" });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container mx-auto pt-4 sm:pt-6 md:pt-10 pb-4 md:pb-6 flex flex-col items-center px-3 sm:px-4">
        <img
          src={Target}
          width={820}
          className="max-w-full h-auto drop-shadow-sm sm:drop-shadow md:drop-shadow-lg"
          alt="Flower Target"
          style={{ maxWidth: "min(100%, 680px)" }}
        />
        <div className="mt-2 sm:mt-3 md:mt-5 text-xs sm:text-sm md:text-lg font-medium px-3 sm:px-4 py-1.5 sm:py-2 text-center">
          Total Pushp Offered: <br></br><span className="font-bold text-2xl sm:text-3xl md:text-5xl text-blue-600 tracking-tight">{baseline + manualOffset + totalPetals}</span>
        </div>
        {!isWithinWindow && (
          <div className="mt-2 text-xs sm:text-sm md:text-base text-red-600 font-medium text-center">
            Pushp offering is currently closed.
          </div>
        )}
      </header>

      <main className="container mx-auto pb-28 sm:pb-36 md:pb-44 px-3 sm:px-4">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 max-w-5xl mx-auto">
          <div className="text-left">
            <Label htmlFor="roll" className="text-xs sm:text-sm">Roll number</Label>
            <Input
              id="roll"
              placeholder="Enter roll number"
              inputMode="numeric"
              value={roll}
              onChange={(e) => setRoll(e.currentTarget.value)}
              required
              className="text-base sm:text-lg h-10 sm:h-11"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 sm:mb-2.5 md:mb-3">
              <p className="font-medium text-sm sm:text-base md:text-lg">Choose Pushp</p>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Selected: <span className="font-bold">{currentSelected}</span>
              </p>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3 md:gap-4 justify-items-center">
              {FLOWER_PETALS.map((petal) => (
                <div key={petal.id} className="flex flex-col items-center gap-1.5 sm:gap-2 w-full">
                  <label 
                    htmlFor={petal.id} 
                    className={`flex flex-col items-center gap-1 ${isWithinWindow ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} w-full touch-manipulation select-none`}
                  >
                    <Checkbox 
                      id={petal.id} 
                      checked={!!selected[petal.id]} 
                      onCheckedChange={(v) => handleChecked(petal.id, v)} 
                      className="sr-only" 
                      disabled={!isWithinWindow}
                    />
                    <div
                      ref={(el) => (optionImgRefs.current[petal.id] = el)}
                      className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full transition-all duration-200 flex items-center justify-center ${
                        selected[petal.id] ? 'scale-110' : 'scale-100 opacity-40'
                      }`}
                      style={{
                        backgroundColor: selected[petal.id] ? `${petal.color}20` : 'hsl(var(--muted))',
                        borderColor: selected[petal.id] ? petal.color : 'hsl(var(--border))',
                      }}
                    >
                      {petal.icon}
                    </div>
                    <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground text-center leading-tight">{petal.name}</span>
                  </label>
                  
                  {/* Counter/input for petals with count */}
                  {selected[petal.id] && (petal.maxCount || petal.allowInput) && (
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-1">
                      {!petal.allowInput ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full"
                            onClick={() => handleCountChange(petal.id, (petalCounts[petal.id] || 1) - 1)}
                            disabled={!isWithinWindow}
                          >
                            <Minus size={12} className="sm:size-[14px] md:size-4" />
                          </Button>
                          <span className="text-xs sm:text-sm font-medium w-5 sm:w-6 md:w-7 text-center">
                            {petalCounts[petal.id] || 1}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full"
                            onClick={() => handleCountChange(petal.id, (petalCounts[petal.id] || 1) + 1)}
                            disabled={!isWithinWindow}
                          >
                            <Plus size={12} className="sm:size-[14px] md:size-4" />
                          </Button>
                        </>
                      ) : (
                        petal.maxCount ? (
                          <Input
                            type="number"
                            min="1"
                            max={petal.maxCount}
                            value={petalCounts[petal.id] || 1}
                            onChange={(e) => handleInputCountChange(petal.id, e.target.value)}
                            className="h-7 sm:h-8 w-12 sm:w-14 md:w-16 text-xs sm:text-sm text-center p-1"
                            disabled={!isWithinWindow}
                          />
                        ) : (
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            value={petalInputs[petal.id] ?? ''}
                            onChange={(e) => handleFreeInputChange(petal.id, e.target.value)}
                            className="h-7 sm:h-8 w-14 sm:w-16 md:w-20 text-xs sm:text-sm text-center p-1"
                            disabled={!isWithinWindow}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 sticky bottom-16 md:static bg-gradient-to-t from-background via-background to-transparent pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4 md:pb-0 md:bg-none">
            <Button 
              type="submit" 
              disabled={animating || currentSelected === 0 || !isWithinWindow} 
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-base sm:text-lg py-3 sm:py-3 md:py-2"
              size="lg"
            >
              {animating ? "Submitting..." : !isWithinWindow ? "Closed" : `Submit${currentSelected > 0 ? ` (${currentSelected})` : ''}`}
            </Button>
          </div>
        </form>
        
      </main>

      {/* Fixed individual pots at the bottom */}
      <div className="fixed inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-background to-transparent pt-8 sm:pt-10 pb-2 md:pt-0 md:bg-none">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="mx-auto w-full max-w-5xl">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3 md:gap-4 justify-items-center">
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
        <DialogContent className="mx-3 sm:mx-4 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              You have selected {currentSelected} pushp. Are you sure you want to submit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              className="mt-2 sm:mt-0"
            >
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

      
    </div>
  );
};

export default Index;