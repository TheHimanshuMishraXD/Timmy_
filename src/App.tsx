import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Compass,
  Droplets,
  HelpCircle,
  Home,
  Leaf,
  LocateFixed,
  MapPin,
  Menu,
  Search,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Sun,
  TreePine,
  Waves,
  Zap,
  Gauge,
  CloudSun,
} from 'lucide-react';

type Step = 'plot' | 'preferences' | 'review';
type OptionKey = 'sun' | 'water' | 'green' | 'cost';
type LocationState = 'idle' | 'loading' | 'success' | 'error';
type Coordinates = { lat: number; lon: number };
type MaterialRates = { aggregate: number; sand: number; cement: number; steel: number };

const marketRates: MaterialRates = { aggregate: 53, sand: 44, cement: 375, steel: 57 };

const steps: { id: Step; label: string; number: string }[] = [
  { id: 'plot', label: 'Your plot', number: '01' },
  { id: 'preferences', label: 'Preferences', number: '02' },
  { id: 'review', label: 'Your plan', number: '03' },
];

const options: { id: OptionKey; label: string; note: string; icon: typeof Sun }[] = [
  { id: 'sun', label: 'Keep it cool', note: 'Reduce harsh west sun', icon: Sun },
  { id: 'water', label: 'Save rainwater', note: 'Recharge before runoff', icon: Droplets },
  { id: 'green', label: 'Grow green', note: 'Leave room for trees', icon: TreePine },
  { id: 'cost', label: 'Watch the budget', note: 'Make every metre count', icon: BarChart3 },
];

const plotPoints = '86,92 206,49 302,72 345,154 306,238 206,267 116,239 54,170';

function App() {
  const [activeStep, setActiveStep] = useState<Step>('plot');
  const [menuOpen, setMenuOpen] = useState(false);
  const [plotName, setPlotName] = useState('Bhopal family home');
  const [area, setArea] = useState('2400');
  const [access, setAccess] = useState('north');
  const [selected, setSelected] = useState<OptionKey[]>(['sun', 'water', 'green']);
  const [generated, setGenerated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [showLayers, setShowLayers] = useState(true);
  const [locationQuery, setLocationQuery] = useState('Bhopal, Madhya Pradesh');
  const [location, setLocation] = useState<Coordinates>({ lat: 23.2599, lon: 77.4126 });
  const [locationState, setLocationState] = useState<LocationState>('idle');

  const formattedArea = Number(area || 0).toLocaleString('en-IN');
  const selectedLabels = useMemo(
    () => options.filter((option) => selected.includes(option.id)).map((option) => option.label),
    [selected],
  );

  const toggleOption = (id: OptionKey) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const searchLocation = async () => {
    const query = locationQuery.trim();
    if (!query) return;
    setLocationState('loading');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Location search failed');
      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      const result = results[0];
      if (!result) throw new Error('No location found');
      setLocation({ lat: Number(result.lat), lon: Number(result.lon) });
      setLocationQuery(result.display_name.split(',').slice(0, 2).join(','));
      setLocationState('success');
    } catch {
      setLocationState('error');
    }
  };

  const useCurrentLocation = () => {
    setLocationState('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setLocationQuery('Current location');
        setLocationState('success');
      },
      () => setLocationState('error'),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const generatePlan = () => {
    setGenerated(true);
    setActiveStep('review');
  };

  const reset = () => { 
    setActiveStep('plot');
    setGenerated(false);
    setSelectedPlan(0);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Leaf size={18} strokeWidth={2.5} /></div>
          <div><strong>TIMMY</strong><span>SUSTAINABLE PLOT PLANNER</span></div>
        </div>
        <div className="topbar-right">
          <span className="saved-pill"><span className="saved-dot" /> Saved locally</span>
          <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><Menu size={20} /></button>
          <button className="avatar">SK</button>
        </div>
        {menuOpen && <div className="menu-popover"><button onClick={reset}><RotateCcw size={15} /> Start a new plan</button><button><HelpCircle size={15} /> How TIMMY works</button></div>}
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-intro">
            <span className="eyebrow">NIRMAAN 2026</span>
            <h1>Make space<br /><em>work harder.</em></h1>
            <p>Turn an awkward plot into a cooler, greener home plan — without the guesswork.</p>
          </div>
          <nav className="step-nav" aria-label="Planner steps">
            {steps.map((step, index) => {
              const isActive = activeStep === step.id;
              const isDone = (generated && index < 2) || (activeStep === 'preferences' && index === 0);
              return <button key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`} onClick={() => (step.id === 'review' && !generated ? undefined : setActiveStep(step.id))}>
                <span className="step-number">{isDone ? <Check size={14} /> : step.number}</span><span>{step.label}</span>{isActive && <ArrowRight size={15} className="step-arrow" />}
              </button>;
            })}
          </nav>
          <div className="sidebar-foot"><ShieldCheck size={16} /><span>Your inputs stay on this device.</span></div>
        </aside>

        <main className="main-content">
          <div className="mobile-heading"><span className="eyebrow">NIRMAAN 2026</span><h1>Make space <em>work harder.</em></h1></div>
          {activeStep !== 'review' ? <>
            <div className="page-heading"><div><span className="eyebrow">STEP {activeStep === 'plot' ? '01' : '02'} / 03</span><h2>{activeStep === 'plot' ? 'Tell us about your plot' : 'What matters most?'}</h2><p>{activeStep === 'plot' ? 'A few simple details are enough to get started.' : 'Pick the outcomes you want your plan to protect.'}</p></div><div className="heading-badge"><Sparkles size={16} /> Decision-ready in 60 sec</div></div>
            {activeStep === 'plot' ? <section className="builder-grid">
              <div className="form-card card">
                <div className="card-label"><span className="label-icon"><Ruler size={16} /></span><div><strong>Plot details</strong><span>Use approximate values if needed</span></div></div>
                <label>Give your plot a name<input value={plotName} onChange={(event) => setPlotName(event.target.value)} placeholder="e.g. My new home" /></label>
                <div className="field-row"><label>Approx. area<div className="input-with-suffix"><input value={area} onChange={(event) => setArea(event.target.value.replace(/[^0-9]/g, ''))} /><span>sq ft</span></div></label><label>Road access<select value={access} onChange={(event) => setAccess(event.target.value)}><option value="north">North side</option><option value="east">East side</option><option value="south">South side</option><option value="west">West side</option></select></label></div>
                <div className="tip"><Compass size={17} /><span><strong>Why we ask:</strong> Entry direction helps us place your home and garden naturally.</span></div>
                <button className="primary-button" onClick={() => setActiveStep('preferences')}>Continue to preferences <ArrowRight size={17} /></button>
              </div>
              <div className="plot-card card"><div className="plot-card-top"><div><span className="eyebrow">SITE CONTEXT</span><h3>{plotName || 'Your plot'}</h3></div><span className="area-chip">{formattedArea} sq ft</span></div><div className="location-search"><div className="search-input"><Search size={15} /><input value={locationQuery} onChange={(event) => { setLocationQuery(event.target.value); setLocationState('idle'); }} onKeyDown={(event) => { if (event.key === 'Enter') void searchLocation(); }} placeholder="Search city, village or address" /><button onClick={() => void searchLocation()} disabled={locationState === 'loading'} aria-label="Search location">{locationState === 'loading' ? <span className="spinner" /> : <ArrowRight size={15} />}</button></div><button className="locate-button" onClick={useCurrentLocation}><LocateFixed size={14} /> Use my location</button></div><LocationMap location={location} locationState={locationState} /><div className="map-meta"><span><MapPin size={13} /> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span><span className={`location-message ${locationState}`}>{locationState === 'success' ? 'Site context updated' : locationState === 'error' ? 'Try a nearby place name' : 'OpenStreetMap context'}</span></div><div className="boundary-divider"><span>PLANNING BOUNDARY</span><i /></div><PlotPreview showLayers={showLayers} /><div className="plot-legend"><span><i className="legend-house" />Home zone</span><span><i className="legend-green" />Green buffer</span><span><i className="legend-road" />Access road</span></div><button className="layers-toggle" onClick={() => setShowLayers(!showLayers)}>{showLayers ? 'Hide' : 'Show'} planning layers <ChevronDown size={14} /></button></div>
            </section> : <section className="preference-layout"><div className="preference-card card"><div className="card-label"><span className="label-icon"><Leaf size={16} /></span><div><strong>Your sustainability brief</strong><span>Choose as many as feel right</span></div></div><div className="option-list">{options.map((option) => { const Icon = option.icon; const active = selected.includes(option.id); return <button key={option.id} className={`option-row ${active ? 'selected' : ''}`} onClick={() => toggleOption(option.id)}><span className="option-icon"><Icon size={18} /></span><span className="option-copy"><strong>{option.label}</strong><small>{option.note}</small></span><span className={`check-box ${active ? 'checked' : ''}`}>{active && <Check size={14} />}</span></button>; })}</div><div className="check-strip"><div><CloudSun size={16} /><span><strong>Sun + wind</strong><small>Passive cooling</small></span></div><div><Waves size={16} /><span><strong>Water cycle</strong><small>Recharge ready</small></span></div><div><Gauge size={16} /><span><strong>Cost clarity</strong><small>Early estimate</small></span></div></div><div className="preference-actions"><button className="quiet-button" onClick={() => setActiveStep('plot')}><ArrowRight size={16} className="back-icon" /> Back</button><button className="primary-button" onClick={generatePlan}>Generate my plan <Sparkles size={16} /></button></div></div><div className="brief-card"><span className="quote-mark">“</span><h3>A good plan listens before it builds.</h3><p>TIMMY balances hard constraints like setbacks and access with softer goals like shade, water and a useful garden.</p><div className="mini-stat"><strong>{selected.length}</strong><span>priorities selected<br />for your brief</span></div></div></section>}
          </> : <PlanView selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} onReset={reset} area={formattedArea} areaValue={Number(area) || 0} selectedLabels={selectedLabels} plotName={plotName} />}
        </main>
      </div>
    </div>
  );
}

function LocationMap({ location, locationState }: { location: Coordinates; locationState: LocationState }) {
  const delta = 0.025;
  const bbox = `${location.lon - delta}%2C${location.lat - delta}%2C${location.lon + delta}%2C${location.lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${location.lat}%2C${location.lon}`;
  return <div className="site-map"><iframe title="OpenStreetMap site context" src={src} loading="lazy" />{locationState === 'loading' && <div className="map-loading"><span className="spinner" /> Updating site context</div>}</div>;
}

function PlotPreview({ showLayers }: { showLayers: boolean }) {
  return <div className="plot-preview"><div className="compass"><span>N</span><Compass size={15} /></div><svg viewBox="0 0 400 310" role="img" aria-label="Irregular plot preview"><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#dfe7df" strokeWidth="1" /></pattern></defs><rect width="400" height="310" fill="url(#grid)" /><polyline points={plotPoints} fill="#edf2df" stroke="#0d4135" strokeWidth="3" /><polygon points="110,105 201,77 245,93 255,158 210,187 132,174" fill="#fbf7ef" stroke="#e57a3b" strokeWidth="2" /><text x="168" y="137" fill="#0d4135" fontSize="13" fontWeight="600">HOME</text>{showLayers && <><path d="M86 92 Q180 104 302 72" fill="none" stroke="#48ad7b" strokeWidth="10" strokeLinecap="round" opacity=".8" /><circle cx="86" cy="92" r="11" fill="#48ad7b" /><circle cx="302" cy="72" r="11" fill="#48ad7b" /><path d="M54 170 Q83 211 116 239" fill="none" stroke="#88c8a3" strokeWidth="8" strokeDasharray="3 7" /><path d="M345 154 L381 154" stroke="#e57a3b" strokeWidth="7" strokeLinecap="round" /><text x="356" y="145" fill="#b55b2a" fontSize="11">ROAD</text></>}</svg><div className="north-label">North</div></div>;
}

function CostEstimator({ builtUpArea, quantities, rates, materialCosts, materialTotal, timmyTotal, expertTotal, savings, updateRate, formatCurrency }: { builtUpArea: number; quantities: Record<keyof MaterialRates, number>; rates: MaterialRates; materialCosts: Record<keyof MaterialRates, number>; materialTotal: number; timmyTotal: number; expertTotal: number; savings: number; updateRate: (key: keyof MaterialRates, value: string) => void; formatCurrency: (value: number) => string }) {
  const costRows: Array<{ key: keyof MaterialRates; label: string; unit: string; quantity: number }> = [
    { key: 'aggregate', label: '20mm aggregate', unit: '₹ / cu ft', quantity: quantities.aggregate },
    { key: 'sand', label: 'M-sand', unit: '₹ / cu ft', quantity: quantities.sand },
    { key: 'cement', label: 'Cement', unit: '₹ / bag', quantity: quantities.cement },
    { key: 'steel', label: 'TMT steel', unit: '₹ / kg', quantity: quantities.steel },
  ];
  const timmyWidth = Math.min(100, (timmyTotal / expertTotal) * 100);
  return <section className="cost-section">
    <div className="cost-heading"><div><span className="eyebrow">COST + FEASIBILITY</span><h3>Know the number before you build.</h3><p>Material rates are editable so your estimate can stay close to your local market.</p></div><span className="rate-source"><Check size={13} /> Bhopal reference rates</span></div>
    <div className="cost-grid">
      <div className="rate-card card"><div className="rate-card-heading"><div><strong>Material basket</strong><span>Approx. quantities for {builtUpArea.toLocaleString('en-IN')} sq ft built-up area</span></div><BarChart3 size={18} /></div><div className="rate-list">{costRows.map((row) => <div className="rate-row" key={row.key}><div><strong>{row.label}</strong><small>{row.quantity.toLocaleString('en-IN')} {row.key === 'cement' ? 'bags' : row.key === 'steel' ? 'kg' : 'cu ft'}</small></div><label><span>{row.unit}</span><input value={rates[row.key]} onChange={(event) => updateRate(row.key, event.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" /></label><b>{formatCurrency(materialCosts[row.key])}</b></div>)}</div><div className="rate-total"><span>Material subtotal</span><strong>{formatCurrency(materialTotal)}</strong></div><p className="rate-note">Reference: aggregate around ₹1,199/tonne in Bhopal, converted to an indicative loose cu ft rate. Confirm with your supplier before ordering.</p></div>
      <div className="compare-card card"><div className="compare-top"><div><span className="eyebrow">TWO LENSES</span><h4>Advice you can discuss</h4></div><Sparkles size={18} /></div><div className="cost-figure"><span>TIMMY estimate</span><strong>{formatCurrency(timmyTotal)}</strong><small>materials + labour + services + finishes</small></div><div className="comparison-bars"><div className="bar-label"><span>TIMMY</span><b>{formatCurrency(timmyTotal)}</b></div><div className="bar-track"><i style={{ width: `${timmyWidth}%` }} /></div><div className="bar-label"><span>Expert benchmark</span><b>{formatCurrency(expertTotal)}</b></div><div className="bar-track expert"><i /></div></div><div className="advice-split"><div><span className="advice-kicker">TIMMY ADVICE</span><strong>Start with the compact core.</strong><p>Keep 45% of the plot open so cooling, water and future growth remain affordable.</p></div><div><span className="advice-kicker expert-label">EXPERT CHECK</span><strong>Budget a {Math.round((expertTotal / Math.max(1, timmyTotal) - 1) * 100)}% contingency.</strong><p>A local architect or engineer should verify soil, structure, labour and approvals.</p></div></div><div className="savings-callout"><strong>{formatCurrency(savings)}</strong><span>potential headroom versus the benchmark<br />before site-specific changes</span></div></div>
    </div>
  </section>;
}

function PlanView({ selectedPlan, setSelectedPlan, onReset, area, areaValue, selectedLabels, plotName }: { selectedPlan: number; setSelectedPlan: (value: number) => void; onReset: () => void; area: string; areaValue: number; selectedLabels: string[]; plotName: string }) {
  const [rates, setRates] = useState<MaterialRates>(marketRates);
  const plans = [{ name: 'Courtyard cool', score: '92', tag: 'Best balance', copy: 'A shaded central court keeps the home breezy while the north edge becomes a productive garden.', color: '#2f9b72' }, { name: 'Garden first', score: '88', tag: 'Most green', copy: 'A smaller footprint unlocks a generous rain garden and an orchard along the quiet edge.', color: '#71ad55' }, { name: 'Compact comfort', score: '84', tag: 'Lowest cost', copy: 'A clean, efficient footprint keeps construction simple and preserves a sunny outdoor room.', color: '#e57a3b' }];
  const current = plans[selectedPlan];
  const builtUpArea = Math.max(400, Math.round(areaValue * 0.55));
  const quantities = { aggregate: Math.round(builtUpArea * 0.14), sand: Math.round(builtUpArea * 0.1), cement: Math.round(builtUpArea * 0.12), steel: Math.round(builtUpArea * 4.2) };
  const materialCosts = { aggregate: quantities.aggregate * rates.aggregate, sand: quantities.sand * rates.sand, cement: quantities.cement * rates.cement, steel: quantities.steel * rates.steel };
  const materialTotal = Object.values(materialCosts).reduce((sum, value) => sum + value, 0);
  const timmyTotal = materialTotal + builtUpArea * 520 + builtUpArea * 340 + builtUpArea * 850;
  const expertTotal = builtUpArea * 2250;
  const savings = Math.max(0, expertTotal - timmyTotal);
  const updateRate = (key: keyof MaterialRates, value: string) => setRates((currentRates) => ({ ...currentRates, [key]: Number(value) || 0 }));
  const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const exportPlan = () => {
    const plan = `${plotName || 'TIMMY plot plan'}\n\n${current.name} — ${current.score}/100\n${current.copy}\n\nSite area: ${area} sq ft\nPriorities: ${selectedLabels.join(', ') || 'Balanced brief'}\n\nTIMMY Sustainable Plot Planner`;
    const url = URL.createObjectURL(new Blob([plan], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(plotName || 'timmy-plot-plan').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return <div className="plan-view"><div className="page-heading plan-heading"><div><span className="eyebrow">YOUR TIMMY PLAN</span><h2>{plotName || 'Your plot'} is ready to build on.</h2><p>Three considered directions, scored against your priorities.</p></div><button className="quiet-button new-plan-button" onClick={onReset}><RotateCcw size={15} /> New plan</button></div><div className="result-grid"><div className="result-visual card"><div className="visual-header"><span className="eyebrow">OPTION {selectedPlan + 1} / 3</span><span className="score-badge"><Zap size={14} /> {current.score} / 100</span></div><div className="plan-drawing"><svg viewBox="0 0 500 340" role="img" aria-label={`${current.name} layout`}><rect width="500" height="340" fill="#f5f3e9" /><path d="M55 45 L190 20 L430 62 L454 275 L308 318 L75 280 Z" fill="#e9f0dd" stroke="#0d4135" strokeWidth="4" /><path d="M139 91 L282 65 L350 103 L325 202 L191 226 L119 177 Z" fill="#fffaf1" stroke={current.color} strokeWidth="4" /><path d="M350 103 C395 120 405 180 397 239" fill="none" stroke="#77b760" strokeWidth="26" opacity=".8" /><path d="M75 280 Q130 246 191 226" fill="none" stroke="#70b795" strokeWidth="10" strokeDasharray="4 8" /><circle cx="98" cy="77" r="15" fill="#65b47d" /><circle cx="413" cy="85" r="15" fill="#65b47d" /><text x="202" y="151" fill="#0d4135" fontSize="18" fontWeight="700">HOME</text><text x="207" y="176" fill="#66756d" fontSize="12">cool core</text><text x="368" y="174" fill="#356e48" fontSize="12" transform="rotate(76 368 174)">GREEN EDGE</text><path d="M455 275 L480 275" stroke="#e57a3b" strokeWidth="9" strokeLinecap="round" /><text x="448" y="298" fill="#b55b2a" fontSize="11">ACCESS</text></svg></div><div className="drawing-caption"><span><i className="legend-house" />Built area</span><span><i className="legend-green" />Landscape</span><span><i className="legend-road" />Water path</span></div></div><div className="result-side"><div className="option-picker">{plans.map((plan, index) => <button key={plan.name} className={selectedPlan === index ? 'picked' : ''} onClick={() => setSelectedPlan(index)}><span className="picker-index">0{index + 1}</span><span><strong>{plan.name}</strong><small>{plan.tag}</small></span><span className="picker-score">{plan.score}</span></button>)}</div><div className="why-card card"><div className="why-header"><span className="label-icon"><Sparkles size={15} /></span><strong>Why this one works</strong></div><p>{current.copy}</p><div className="metric-list"><div><Sun size={15} /><span>Sun control</span><b>High</b></div><div><Droplets size={15} /><span>Water ready</span><b>Good</b></div><div><Home size={15} /><span>Build efficiency</span><b>High</b></div></div></div><div className="plan-footer"><span><Ruler size={15} /> {area} sq ft plot</span><span><Leaf size={15} /> {selectedLabels.length ? selectedLabels.join(' · ') : 'Balanced brief'}</span></div></div></div><CostEstimator builtUpArea={builtUpArea} quantities={quantities} rates={rates} materialCosts={materialCosts} materialTotal={materialTotal} timmyTotal={timmyTotal} expertTotal={expertTotal} savings={savings} updateRate={updateRate} formatCurrency={formatCurrency} /><div className="next-step"><div><span className="eyebrow">NEXT, WHEN YOU'RE READY</span><strong>Take this idea to a local architect.</strong><p>Your plan is a conversation starter, not a construction drawing.</p></div><button className="secondary-button" onClick={exportPlan}>Export plan <ArrowRight size={16} /></button></div></div>;
}

export default App;
