'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { isValidLocale, getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import { Keyboard, RefreshCw, Clock, Gauge, Target, Type } from 'lucide-react';

const SPANISH_TEXTS = [
  'El sol brillaba sobre las montañas mientras los pájaros cantaban entre los árboles. Era una mañana perfecta para caminar por el sendero y disfrutar de la naturaleza.',
  'La tecnología ha cambiado la forma en que vivimos y trabajamos. Cada día surgen nuevas herramientas que nos ayudan a ser más productivos y creativos en nuestras tareas diarias.',
  'La música es un lenguaje universal que conecta a las personas sin importar su origen. Una melodía puede alegrar el día más gris y hacer que recordemos momentos especiales.',
  'Los libros son ventanas a otros mundos. A través de la lectura podemos viajar a lugares lejanos, conocer personajes fascinantes y vivir aventuras increíbles sin movernos de casa.',
  'El aprendizaje continuo es clave para el crecimiento personal. Cada día tenemos la oportunidad de adquirir nuevos conocimientos y habilidades que nos ayudan a mejorar.',
  'La cocina tradicional española es reconocida mundialmente por su variedad y sabor. Desde la paella valenciana hasta el gazpacho andaluz, cada región tiene sus propios platos típicos.',
  'El deporte no solo mejora nuestra salud física, sino también nuestra salud mental. Hacer ejercicio regularmente ayuda a reducir el estrés y nos hace sentir más felices y energéticos.',
  'Viajar es una de las experiencias más enriquecedoras. Conocer nuevas culturas, probar comidas diferentes y ver paisajes impresionantes nos abre la mente y el corazón.',
  'La amistad es uno de los tesoros más valiosos de la vida. Los verdaderos amigos están ahí en los momentos buenos y malos, ofreciendo su apoyo incondicional y su cariño sincero.',
  'El café es mucho más que una bebida: es un ritual matutino, una excusa para reunirse con amigos y un momento de pausa en medio del ajetreado día.',
  'La inteligencia artificial está transformando industrias enteras. Desde la medicina hasta la educación, esta tecnología promete revolucionar la forma en que interactuamos con el mundo digital.',
  'El cine hispanohablante ha producido algunas de las películas más aclamadas de la historia. Directores como Almodóvar, Cuarón e Iñárritu han llevado el talento latino a todo el mundo.',
  'La jardinería es una actividad terapéutica que conecta a las personas con la tierra. Cuidar de las plantas y verlas crecer nos enseña paciencia y nos recompensa con belleza natural.',
  'El internet ha democratizado el acceso a la información. Hoy cualquier persona con conexión puede aprender sobre cualquier tema, desde programación hasta historia del arte renacentista.',
  'Las estaciones del año traen consigo cambios hermosos en la naturaleza. El otoño pinta los árboles de colores cálidos, mientras que la primavera llena el aire con el aroma de las flores.',
];

export default function TypingTestPage() {
  const params = useParams();
  const locale = params.locale as string;
  if (!isValidLocale(locale)) return null;
  const dict = getDictionary(locale as Locale);

  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [duration, setDuration] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<{ wpm: number; accuracy: number; chars: number; correct: number; incorrect: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const charCountRef = useRef(0);
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);

  const startTest = useCallback(() => {
    const newText = SPANISH_TEXTS[Math.floor(Math.random() * SPANISH_TEXTS.length)];
    setText(newText);
    setUserInput('');
    setTimeLeft(duration);
    setIsRunning(true);
    setIsFinished(false);
    setResults(null);
    charCountRef.current = 0;
    correctRef.current = 0;
    incorrectRef.current = 0;
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      finishTest();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, timeLeft]);

  const finishTest = () => {
    setIsRunning(false);
    setIsFinished(true);
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    const minutes = Math.max(elapsed, duration / 60);
    const wpm = Math.round((charCountRef.current / 5) / minutes);
    const total = correctRef.current + incorrectRef.current;
    const accuracy = total > 0 ? Math.round((correctRef.current / total) * 100) : 0;
    setResults({ wpm, accuracy, chars: charCountRef.current, correct: correctRef.current, incorrect: incorrectRef.current });
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (!isRunning) return;
    const prevLen = userInput.length;
    setUserInput(value);
    if (value.length > prevLen) {
      const newChar = value[value.length - 1];
      const expected = text[prevLen] || '';
      charCountRef.current++;
      if (newChar === expected) correctRef.current++;
      else incorrectRef.current++;
    }
  };

  const getCharClass = (index: number) => {
    if (index >= userInput.length) return '';
    const typed = userInput[index];
    const expected = text[index];
    if (typed === expected) return 'text-green-500';
    return 'text-red-500 bg-red-500/20';
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl tool-icon shadow-lg">
          <Keyboard className="h-7 w-7 text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">{dict.typingTest}</h1>
        <p className="text-muted-foreground">{dict.siteTagline}</p>
      </div>

      {!isRunning && !isFinished && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="mb-6 text-muted-foreground">{dict.selectTime}:</p>
          <div className="mb-6 flex justify-center gap-3">
            {[15, 30, 60, 120].map(t => (
              <button key={t} onClick={() => setDuration(t)}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${duration === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                {t}s
              </button>
            ))}
          </div>
          <button onClick={startTest} className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <Keyboard className="h-5 w-5" /> {dict.start}
          </button>
        </div>
      )}

      {(isRunning || isFinished) && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-lg font-bold" style={{ color: timeLeft < 10 ? '#ef4444' : 'var(--foreground)' }}>
                <Clock className="h-5 w-5" /> {timeLeft}s
              </div>
            </div>
            {!isFinished && (
              <button onClick={() => { setIsRunning(false); startTest(); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-4 w-4" /> {dict.reset}
              </button>
            )}
          </div>

          <div className="mb-4 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 text-lg leading-relaxed tracking-wide">
              {text.split('').map((char, i) => (
                <span key={i} className={`${getCharClass(i)} transition-colors`}>
                  {char}
                </span>
              ))}
            </div>
            {isRunning && (
              <textarea ref={inputRef} value={userInput} onChange={handleInput} onPaste={e => e.preventDefault()}
                className="h-24 w-full rounded-lg border border-border bg-background p-3 font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Empieza a escribir aquí..." />
            )}
          </div>

          {isFinished && results && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-center text-xl font-semibold">{dict.yourResults}</h2>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
                {[
                  { icon: Gauge, label: dict.wpm, value: results.wpm },
                  { icon: Target, label: dict.accuracy, value: `${results.accuracy}%` },
                  { icon: Type, label: dict.characters, value: results.chars },
                  { icon: null, label: dict.correct, value: results.correct, color: 'text-green-500' },
                  { icon: null, label: dict.incorrect, value: results.incorrect, color: 'text-red-500' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="rounded-lg bg-secondary/50 p-3 text-center">
                    {Icon && <Icon className="mx-auto mb-1 h-5 w-5 text-primary" />}
                    <p className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button onClick={startTest} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <RefreshCw className="h-4 w-4" /> {dict.tryAgain}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
