import { useRef, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  GitCompare,
  LineChart as LineChartIcon,
  Trash2,
  X,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PhotoEntry, UserData } from '@/lib/types';
import { uid } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProgressProps {
  data: UserData;
  onChange: (data: UserData) => void;
}

/** Comprime a foto no navegador antes de salvar (máx 1000px, JPEG 72%) */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas indisponível'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Progress({ data, onChange }: ProgressProps) {
  const [weightInput, setWeightInput] = useState('');
  const [comparing, setComparing] = useState<[PhotoEntry, PhotoEntry] | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [addingWeight, setAddingWeight] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const addPhoto = async (file: File) => {
    try {
      const image = await compressImage(file);
      const entry: PhotoEntry = { id: uid(), date: new Date().toISOString(), image };
      onChange({ ...data, photos: [entry, ...data.photos] });
    } catch {
      // falha silenciosa: o input permanece disponível para nova tentativa
    }
  };

  const addWeight = () => {
    const kg = Number(weightInput.replace(',', '.'));
    if (!kg || kg < 30 || kg > 300) return;
    onChange({
      ...data,
      weights: [...data.weights, { date: new Date().toISOString(), kg }].slice(-60),
    });
    setWeightInput('');
    setAddingWeight(false);
  };

  const removePhoto = (id: string) => {
    onChange({ ...data, photos: data.photos.filter((p) => p.id !== id) });
    if (comparing && (comparing[0].id === id || comparing[1].id === id)) setComparing(null);
  };

  const openCompare = (photo: PhotoEntry) => {
    if (data.photos.length < 2) return;
    const others = data.photos.filter((p) => p.id !== photo.id);
    const oldest = others[others.length - 1];
    setComparing([oldest, photo]);
    setSliderPos(50);
  };

  const onCompareDrag = (clientX: number) => {
    const el = compareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(97, Math.max(3, pct)));
  };

  const chartData = data.weights.map((w) => ({
    date: new Date(w.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    kg: w.kg,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="label-caps">Fotos + peso corporal</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">Sua evolução</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tire fotos de segunda a sexta no mesmo horário e ângulo — a comparação no tempo revela o
          que a balança esconde. As fotos ficam apenas neste navegador.
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => fileRef.current?.click()} className="rounded-xl gap-2">
          <Camera className="h-4 w-4" /> Tirar / enviar foto de hoje
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addPhoto(f);
            e.target.value = '';
          }}
        />
        <Button
          variant="outline"
          onClick={() => setAddingWeight((a) => !a)}
          className="rounded-xl gap-2"
        >
          Registrar peso
        </Button>
      </div>

      {addingWeight && (
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-4">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="w-now">Peso atual (kg)</Label>
            <Input
              id="w-now"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value.replace(/[^\d.,]/g, '').slice(0, 5))}
              placeholder="Ex.: 72,5"
              className="h-11 rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && addWeight()}
            />
          </div>
          <Button onClick={addWeight} className="rounded-xl">
            Salvar
          </Button>
        </div>
      )}

      {/* Comparação */}
      {comparing && (
        <section className="entrance relative overflow-hidden rounded-2xl border border-primary/40 bg-card" aria-label="Comparação de fotos">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <GitCompare className="h-4 w-4 text-primary" />
              {new Date(comparing[0].date).toLocaleDateString('pt-BR')} →{' '}
              {new Date(comparing[1].date).toLocaleDateString('pt-BR')}
            </p>
            <button
              onClick={() => setComparing(null)}
              aria-label="Fechar comparação"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <div
            ref={compareRef}
            className="relative aspect-[4/5] max-h-[520px] w-full cursor-ew-resize touch-none select-none overflow-hidden"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              onCompareDrag(e.clientX);
            }}
            onPointerMove={(e) => e.buttons === 1 && onCompareDrag(e.clientX)}
          >
            <img src={comparing[1].image} alt="Foto atual" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <img
              src={comparing[0].image}
              alt="Foto anterior"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              draggable={false}
            />
            <div className="absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${sliderPos}%` }}>
              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <GitCompare className="h-4 w-4" />
              </div>
            </div>
            <span className="glass absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold">
              Antes · {new Date(comparing[0].date).toLocaleDateString('pt-BR')}
            </span>
            <span className="glass absolute right-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold text-primary">
              Depois · {new Date(comparing[1].date).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </section>
      )}

      {/* Galeria */}
      <section aria-label="Linha do tempo de fotos">
        {data.photos.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
            <Camera className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Nenhuma foto ainda. A primeira foto é a mais importante — ela será o seu "antes".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.photos.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                <button
                  onClick={() => openCompare(photo)}
                  className="block aspect-[4/5] w-full cursor-pointer"
                  aria-label={`Comparar foto de ${new Date(photo.date).toLocaleDateString('pt-BR')}`}
                >
                  <img
                    src={photo.image}
                    alt={`Evolução em ${new Date(photo.date).toLocaleDateString('pt-BR')}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </button>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-3 pt-8">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {new Date(photo.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                    {photo.weightKg && <p className="stat-numeral text-[11px] text-white/70">{photo.weightKg} kg</p>}
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    aria-label="Excluir foto"
                    className="rounded-lg bg-black/40 p-1.5 text-white/80 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Peso */}
      {data.weights.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5" aria-label="Gráfico de peso">
          <div className="mb-4 flex items-center gap-2">
            <LineChartIcon className="h-4.5 w-4.5 text-primary" />
            <p className="font-semibold">Peso ao longo do tempo</p>
            <span className="stat-numeral ml-auto text-sm font-bold text-primary">
              {data.weights[data.weights.length - 1].kg} kg
              {data.weights.length > 1 && (
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  (início: {data.weights[0].kg} kg)
                </span>
              )}
            </span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 16%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'hsl(240 4% 62%)', fontSize: 11 }} stroke="hsl(240 5% 16%)" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'hsl(240 4% 62%)', fontSize: 11 }} stroke="hsl(240 5% 16%)" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(240 7% 6%)',
                    border: '1px solid hsl(240 5% 14%)',
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  labelStyle={{ color: 'hsl(60 3% 94%)' }}
                  itemStyle={{ color: 'hsl(164 100% 43%)' }}
                />
                <Line type="monotone" dataKey="kg" stroke="hsl(164 100% 43%)" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(164 100% 43%)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5 rotate-90" /> Voltar ao topo
      </button>
    </div>
  );
}
