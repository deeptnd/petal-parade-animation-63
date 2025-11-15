import { useEffect, useRef, useState } from "react";
import { EntriesList } from "@/components/EntriesList";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const Admin = () => {
  const { toast } = useToast();
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [totalPetals, setTotalPetals] = useState(0);
  const fixedBaseline = 42000;
  const [windowStart, setWindowStart] = useState<string>("");
  const [windowEnd, setWindowEnd] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [enforceWindow, setEnforceWindow] = useState<boolean>(true);
  const [userEnabled, setUserEnabled] = useState<boolean>(true);
  const [manualOffset, setManualOffset] = useState<number>(0);
  const bcRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Setup broadcast channel to notify users immediately
  useEffect(() => {
    const ch = supabase.channel('app_settings_bc');
    ch.subscribe((status) => {
      // no-op; ensure subscription active to allow send()
    });
    bcRef.current = ch;
    return () => {
      if (bcRef.current) supabase.removeChannel(bcRef.current);
      bcRef.current = null;
    };
  }, []);
  const applyOffsetChange = async (next: number) => {
    const safe = Math.max(0, Math.floor(next));
    setManualOffset(safe);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: 'global', manual_offset: safe } as any);
    if (error) {
      console.error('Error updating manual offset:', error);
      toast({ title: 'Failed', description: 'Could not update pushp offset.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Backside pushp updated.' });
      // Broadcast to all clients
      try {
        await bcRef.current?.send({ type: 'broadcast', event: 'settings_update', payload: { manual_offset: safe } });
      } catch {}
    }
  };

  const deleteOlderThan48h = async () => {
    try {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('flower_entries')
        .delete()
        .lt('created_at', cutoff);
      if (error) throw error;
      // Broadcast maintenance so clients resync immediately
      try { await bcRef.current?.send({ type: 'broadcast', event: 'maintenance', payload: { type: 'older_than_48h' } }); } catch {}
      // Refresh total
      const { data, error: err2 } = await supabase
        .from('flower_entries')
        .select('selected_petals');
      if (!err2 && data) {
        const count = data.reduce((t, e) => t + (e.selected_petals?.length || 0), 0);
        setTotalPetals(count);
      }
      toast({ title: 'Cleaned', description: 'Deleted entries older than 48 hours.' });
    } catch (e) {
      console.error('Delete >48h failed:', e);
      toast({ title: 'Failed', description: 'Could not delete old entries.', variant: 'destructive' });
    }
  };

  const deleteBeforeToday = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const { error } = await supabase
        .from('flower_entries')
        .delete()
        .lt('created_at', startOfDay);
      if (error) throw error;
      try { await bcRef.current?.send({ type: 'broadcast', event: 'maintenance', payload: { type: 'before_today' } }); } catch {}
      const { data, error: err2 } = await supabase
        .from('flower_entries')
        .select('selected_petals');
      if (!err2 && data) {
        const count = data.reduce((t, e) => t + (e.selected_petals?.length || 0), 0);
        setTotalPetals(count);
      }
      toast({ title: 'Reset', description: 'Deleted entries before today.' });
    } catch (e) {
      console.error('Delete before today failed:', e);
      toast({ title: 'Failed', description: 'Could not delete entries before today.', variant: 'destructive' });
    }
  };

  // Auth: read persisted flag
  useEffect(() => {
    const stored = localStorage.getItem('pushp_admin_authed');
    if (stored === 'true') setIsAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? '150000';
    if (!expected) {
      setLoginError("Admin password not configured.");
      return;
    }
    if (password === expected) {
      setIsAuthed(true);
      localStorage.setItem('pushp_admin_authed', 'true');
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("Invalid password.");
    }
  };

  const handleLogout = () => {
    setIsAuthed(false);
    localStorage.removeItem('pushp_admin_authed');
  };

  // Fetch total petals once
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

  // Keep total in sync: realtime + periodic refresh
  useEffect(() => {
    const channel = supabase
      .channel('flower_entries_changes_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flower_entries' },
        (payload) => {
          const eventType = (payload as any).eventType as string | undefined;
          const rowNew: any = (payload as any).new;
          const rowOld: any = (payload as any).old;
          if (eventType === 'INSERT') {
            const added = rowNew?.selected_petals?.length || 0;
            setTotalPetals((prev) => prev + added);
          } else if (eventType === 'DELETE') {
            const removed = rowOld?.selected_petals?.length || 0;
            setTotalPetals((prev) => Math.max(0, prev - removed));
          } else if (eventType === 'UPDATE') {
            const before = rowOld?.selected_petals?.length || 0;
            const after = rowNew?.selected_petals?.length || 0;
            const delta = after - before;
            if (delta !== 0) setTotalPetals((prev) => Math.max(0, prev + delta));
          }
        }
      )
      .subscribe();

    let isActive = true;
    const refresh = async () => {
      try {
        const { data, error } = await supabase
          .from('flower_entries')
          .select('selected_petals');
        if (error) throw error;
        if (!isActive) return;
        const count = data.reduce((total, entry) => total + (entry.selected_petals?.length || 0), 0);
        setTotalPetals(count);
      } catch {}
    };
    const id = setInterval(refresh, 1000);
    const onVis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      supabase.removeChannel(channel);
      isActive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Load persisted settings (baseline local), time window from DB
  useEffect(() => {
    // no baseline load
    (async () => {
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
          setEnforceWindow(Boolean(d.enforce_window ?? true));
          setUserEnabled(Boolean(d.user_enabled ?? true));
          setStartTime(d.start_time ?? "");
          setEndTime(d.end_time ?? "");
          setManualOffset(Number(d.manual_offset ?? 0));
        }
      } catch (err) {
        console.error('Error fetching app settings:', err);
      }
    })();
  }, []);

  // no baseline persistence

  // Realtime subscribe to app_settings changes
  useEffect(() => {
    const channel = supabase
      .channel('app_settings_changes_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: 'id=eq.global' },
        (payload) => {
          const row = (payload.new as any) ?? (payload.old as any);
          if (!row) return;
          setWindowStart(row.window_start ?? "");
          setWindowEnd(row.window_end ?? "");
          setEnforceWindow(Boolean(row.enforce_window ?? true));
          setUserEnabled(Boolean(row.user_enabled ?? true));
          setStartTime(row.start_time ?? "");
          setEndTime(row.end_time ?? "");
          setManualOffset(Number(row.manual_offset ?? 0));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm border rounded-lg p-6 bg-background shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-center">Admin Login</h1>
          <div className="grid gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
            />
          </div>
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700">Login</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container mx-auto pt-6 pb-4 flex flex-col gap-2 px-3 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage baseline, time window, and view entries.</p>
        <div className="text-sm sm:text-base">
          Current displayed total (preview): <span className="font-semibold">{fixedBaseline + manualOffset + totalPetals}</span>
        </div>
        <div>
          <Button type="button" variant="outline" className="h-8" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 pb-10 grid gap-6 sm:gap-8">
        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="userEnabled" className="text-xs sm:text-sm whitespace-nowrap">User page enabled</Label>
              <Switch id="userEnabled" checked={userEnabled} onCheckedChange={setUserEnabled} />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="enforceWindow" className="text-xs sm:text-sm whitespace-nowrap">Enforce time restriction</Label>
              <Switch id="enforceWindow" checked={enforceWindow} onCheckedChange={setEnforceWindow} />
            </div>
            
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" className="h-9" onClick={() => { setWindowStart(""); setWindowEnd(""); }}>Clear Window</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Displayed total = fixed baseline + manual offset + live count.</p>
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="manualOffset">Manual offset (backside add)</Label>
            <Input
              id="manualOffset"
              type="number"
              inputMode="numeric"
              value={manualOffset}
              onChange={(e) => setManualOffset(Number(e.target.value || 0))}
              className="h-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" className="h-8" onClick={() => applyOffsetChange(manualOffset - 10)}>-10</Button>
            <Button type="button" variant="outline" className="h-8" onClick={() => applyOffsetChange(manualOffset - 1)}>-1</Button>
            <Button type="button" className="h-8 bg-blue-600 hover:bg-blue-700" onClick={() => applyOffsetChange(manualOffset + 1)}>+1</Button>
            <Button type="button" className="h-8 bg-blue-600 hover:bg-blue-700" onClick={() => applyOffsetChange(manualOffset + 10)}>+10</Button>
            <Button type="button" className="h-8 bg-blue-600 hover:bg-blue-700" onClick={() => applyOffsetChange(manualOffset + 100)}>+100</Button>
          </div>
          <div>
            <Button
              type="button"
              className="h-9 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Upsert the global app settings in DB (without time fields)
                supabase.from('app_settings').upsert({ id: 'global', window_start: windowStart || null, window_end: windowEnd || null, enforce_window: enforceWindow, user_enabled: userEnabled, manual_offset: manualOffset } as any).then(({ error }) => {
                  if (error) console.error('Error saving app settings:', error);
                });
                toast({ title: 'Updated', description: 'Settings saved.' });
                // Broadcast full settings update
                try {
                  bcRef.current?.send({ type: 'broadcast', event: 'settings_update', payload: { manual_offset: manualOffset } });
                } catch {}
              }}
            >
              Update
            </Button>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="destructive" className="h-9" onClick={deleteOlderThan48h}>
              Delete entries older than 48 hours
            </Button>
            <Button type="button" variant="outline" className="h-9" onClick={deleteBeforeToday}>
              Delete entries before today (start fresh)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Use carefully. This removes data from the database.</p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-lg font-semibold">All Entries</h2>
          <div className="overflow-auto max-h-[65vh] border rounded-md">
            <EntriesList />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;


