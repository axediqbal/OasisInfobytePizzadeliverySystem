import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ShieldCheck, Clock, ArrowRight, Sparkles, Flame, CheckCircle2, Star, Layers, Milk, Salad, Pizza, Zap, Award, ArrowDown, Eye, Plus, ShoppingBag } from 'lucide-react';

const Landing = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [activeCrust, setActiveCrust] = useState('stuffed');
  const [activeToppings, setActiveToppings] = useState(['pepperoni', 'basil', 'mushrooms']);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 25;
      const y = (e.clientY - innerHeight / 2) / 25;
      setMousePos({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTopping = (top) => {
    if (activeToppings.includes(top)) {
      setActiveToppings(activeToppings.filter((t) => t !== top));
    } else {
      setActiveToppings([...activeToppings, top]);
    }
  };

  return (
    <div className="w-full bg-[#0a0a0f] text-[#f3f4f6] min-h-screen overflow-x-hidden selection:bg-[#ff5e00] selection:text-white font-sans">
      
      {/* ============================================================ */}
      {/* BACKGROUND PARTICLES & AMBIENT GLOWS */}
      {/* ============================================================ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep ambient volumetric lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#ff5e00]/15 rounded-full blur-[220px]" />
        <div className="absolute top-2/3 right-0 w-[600px] h-[600px] bg-[#ffb700]/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#d92626]/10 rounded-full blur-[180px]" />

        {/* Floating Ember Dots */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-tr from-[#ffb700] to-[#ff5e00] opacity-40 animate-pulse"
            style={{
              top: `${(i * 19) % 100}%`,
              left: `${(i * 23) % 100}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${(i % 5)}s`,
            }}
          />
        ))}
      </div>

      {/* ============================================================ */}
      {/* 1. HERO SECTION — CINEMATIC 3D PARALLAX REAL ARTISAN PIZZA */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[96vh] flex items-center justify-center pt-8 pb-16 overflow-hidden z-10">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Bold Hero Typography */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Premium Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1c28]/80 border border-[#ff5e00]/40 text-[#ffb700] text-xs font-bold uppercase tracking-widest backdrop-blur-xl shadow-2xl">
                <Flame className="w-4 h-4 text-[#ff5e00] animate-bounce" />
                <span>Woodfired at 900°F • 48-Hour Fermented</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.04]">
                The Art of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb700] via-[#ff5e00] to-[#d92626]">
                  Real Artisan
                </span> <br />
                Pizza.
              </h1>

              {/* Subheadline */}
              <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Indulge in stone-baked perfection. Craft your custom recipe with organic doughs, San Marzano marinara, and pure Fior di Latte mozzarella — tracked live to your doorstep.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/builder"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#ff5e00] to-[#d92626] hover:from-[#ff6f1a] hover:to-[#e63535] text-white font-bold text-base py-4 px-8 rounded-2xl shadow-xl shadow-[#ff5e00]/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <ChefHat className="w-5 h-5" />
                  <span>Start 4-Step Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-[#13131c]/80 hover:bg-[#1a1a26] text-white border border-white/10 hover:border-[#ffb700]/50 font-semibold text-base py-4 px-7 rounded-2xl transition-all"
                >
                  Create Account
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-semibold">100% Organic Caputo Flour</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ffb700]" />
                  <span className="text-white font-semibold">Razorpay Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff5e00]" />
                  <span className="text-white font-semibold">Live Oven Tracker</span>
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic 3D Layered Photorealistic Showcase */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              
              {/* 3D Floating Master Pizza with Mouse Physics */}
              <div
                className="relative w-full max-w-[580px] aspect-square flex items-center justify-center transition-transform duration-300 ease-out"
                style={{
                  transform: `perspective(1200px) rotateY(${mousePos.x * 0.9}deg) rotateX(${-mousePos.y * 0.9}deg) translateZ(20px)`,
                }}
              >
                {/* Volumetric Backlight Ring */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#ff5e00]/50 via-[#ffb700]/30 to-[#d92626]/40 blur-[75px] animate-pulse" />

                {/* Real High-Resolution Photorealistic Pizza */}
                <img
                  src="/images/pizza-floating.png"
                  alt="Artisan Gourmet Pizza"
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_35px_65px_rgba(0,0,0,0.95)] hover:scale-[1.03] transition-transform duration-500"
                />

                {/* Floating Hot Cheese Pull Badge */}
                <div
                  className="absolute -top-4 right-4 z-20 bg-[#13131c]/90 border border-white/15 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center gap-3 animate-bounce"
                  style={{ animationDuration: '4.5s' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff5e00] to-[#ffb700] flex items-center justify-center font-bold text-xl shadow-lg shadow-[#ff5e00]/30">
                    🍕
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Stone Oven Fired</span>
                    <span className="text-[11px] text-[#ffb700] font-semibold">900°F Volcanic Heat</span>
                  </div>
                </div>

                {/* Floating Fresh Herbs Badge */}
                <div
                  className="absolute -bottom-4 left-4 z-20 bg-[#13131c]/90 border border-white/15 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center gap-3 animate-bounce"
                  style={{ animationDuration: '5.5s' }}
                >
                  <span className="text-2xl">🌿</span>
                  <div>
                    <span className="text-xs font-bold text-white block">Genovese Basil</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">Fresh Harvest Daily</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. REAL CHEESE PULL & VOLCANIC STONE OVEN (MACRO PHOTOGRAPHY) */}
      {/* ============================================================ */}
      <section className="w-full py-24 bg-[#11111a]/60 border-y border-white/10 backdrop-blur-xl relative z-10">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#ff5e00]/20 border border-[#ff5e00]/40 text-[#ffb700] text-xs font-bold uppercase tracking-widest">
              Artisanal Standards
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white">
              Taste the Craft in Every Slice
            </h2>
            <p className="text-gray-300 text-base sm:text-lg font-light">
              No frozen dough, no shortcuts. Just pure woodfired tradition and 100% natural ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Real Cheese Pull Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="/images/pizza-cheese-pull.jpg"
                alt="Stretching Mozzarella Cheese Pull"
                className="w-full h-[420px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent flex flex-col justify-end p-8 sm:p-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold self-start mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Whole Milk Fior di Latte
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Legendary Golden Cheese Pull
                </h3>
                <p className="text-sm text-gray-300 mt-2 max-w-md font-light">
                  Fresh mozzarella melts seamlessly over slow-simmered San Marzano tomatoes, creating a rich golden crust and unforgettable stretch.
                </p>
              </div>
            </div>

            {/* Real Stone Oven Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="/images/pizza-hero.jpg"
                alt="Stone Oven Artisan Pizza"
                className="w-full h-[420px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent flex flex-col justify-end p-8 sm:p-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5e00]/20 border border-[#ff5e00]/40 text-[#ffb700] text-xs font-bold self-start mb-3">
                  <Flame className="w-3.5 h-3.5" /> 900°F Volcanic Stone Hearth
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Blistered Crispy Cornicione
                </h3>
                <p className="text-sm text-gray-300 mt-2 max-w-md font-light">
                  Baked on volcanic biscotto stones for exactly 90 seconds, locking in air pockets and producing signature leopard-spot charred crust.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE 3D SLICE DECONSTRUCTION SECTION */}
      {/* ============================================================ */}
      <section className="w-full py-24 relative z-10 overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Floating 3D Slice with Real Cheese Drops */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div
                className="relative w-full max-w-[500px] aspect-square flex items-center justify-center transition-transform duration-300"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePos.x * 1.2}deg) rotateX(${-mousePos.y * 1.2}deg) translateY(${Math.sin(scrollY * 0.005) * 15}px)`,
                }}
              >
                <div className="absolute inset-4 rounded-full bg-[#ff5e00]/30 blur-[80px]" />
                <img
                  src="/images/pizza-slice-flying.png"
                  alt="Floating Artisan Pizza Slice"
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right: Layer Deconstruction Explanation */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#ffb700]/20 border border-[#ffb700]/40 text-[#ffb700] text-xs font-bold uppercase tracking-widest">
                Anatomy of Perfection
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                Inspect Every Delicious Layer
              </h2>

              <p className="text-gray-300 text-base leading-relaxed font-light">
                Every element is calibrated for maximum flavor explosion — from the airy crust structure to the spicy charred pepperoni cupping hot savory oils.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#13131c]/90 border border-white/10 flex items-center justify-between hover:border-[#ff5e00]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌾</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">Layer 1: 48-Hour Fermented Dough</h4>
                      <p className="text-xs text-gray-400">Naturally airy crumb with crispy blistered crust</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#ffb700]">Base</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#13131c]/90 border border-white/10 flex items-center justify-between hover:border-[#ff5e00]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🍅</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">Layer 2: San Marzano Marinara</h4>
                      <p className="text-xs text-gray-400">D.O.P certified vine-ripened Italian tomato spread</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#ffb700]">Sauce</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#13131c]/90 border border-white/10 flex items-center justify-between hover:border-[#ff5e00]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧀</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">Layer 3: Fior di Latte & Crisp Pepperoni</h4>
                      <p className="text-xs text-gray-400">Creamy golden mozzarella with cupped spicy pepperoni</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#ffb700]">Toppings</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/builder"
                  className="btn-primary inline-flex text-sm py-3.5 px-8 rounded-xl font-bold shadow-warm"
                >
                  <ChefHat className="w-5 h-5" />
                  <span>Customize Your Slice Now</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. BENTO GRID FEATURES & ORDER ENGINE */}
      {/* ============================================================ */}
      <section className="w-full py-24 bg-[#11111a]/60 border-y border-white/10 backdrop-blur-xl relative z-10">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Connected Full-Stack Platform
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-light">
              Built with precision MERN architecture linking user orders, live polling, and kitchen inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1: 4-Step Builder */}
            <div className="md:col-span-2 bg-[#13131c]/90 rounded-3xl p-8 sm:p-10 border border-white/10 hover:border-[#ff5e00]/50 transition-all duration-300 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ff5e00]/20 text-[#ff5e00] flex items-center justify-center">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  4-Step Builder with Persistent Side Rail
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light max-w-xl">
                  Choose from 5 artisan crust bases, 5 sauces, 3 cheeses, and 8 fresh farm toppings. The sticky order-summary rail computes itemized totals and verifies stock availability in real time.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {['5 Crusts', '5 Sauces', '3 Cheeses', '8 Toppings'].map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
                <Link to="/builder" className="text-xs text-[#ff5e00] hover:underline font-bold flex items-center gap-1">
                  Launch Builder <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento 2: Razorpay */}
            <div className="bg-[#13131c]/90 rounded-3xl p-8 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Secure Razorpay
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-light">
                  Encrypted test-mode checkout with server-side HMAC-SHA256 signature verification and atomic database inventory decrement.
                </p>
              </div>
              <div className="mt-8">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Instant Confirmation
                </span>
              </div>
            </div>

            {/* Bento 3: Live Polling */}
            <div className="bg-[#13131c]/90 rounded-3xl p-8 border border-white/10 hover:border-[#ffb700]/50 transition-all duration-300 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ffb700]/20 text-[#ffb700] flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  5-Second Live Sync
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-light">
                  Watch order status advance in real-time from <strong>Received → In Kitchen → Sent to Delivery</strong> without manual page refreshes.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5e00] animate-ping" />
                <span className="text-xs text-gray-400 font-medium">Real-time sync active</span>
              </div>
            </div>

            {/* Bento 4: Node-Cron */}
            <div className="md:col-span-2 bg-[#13131c]/90 rounded-3xl p-8 sm:p-10 border border-white/10 hover:border-[#ff5e00]/50 transition-all duration-300 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ff5e00]/20 text-[#ff5e00] flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Automated Low-Stock Node-Cron Alerts
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light max-w-xl">
                  Our backend constantly scans ingredient stock quantities. When an item crosses below its threshold, a single consolidated digest email is dispatched to the admin with 60-minute alert throttling.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400 font-medium">Zero stock-out surprises during dinner rush</span>
                <Link to="/admin/login" className="text-xs text-[#ff5e00] hover:underline font-bold flex items-center gap-1">
                  Admin Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BOTTOM CONVERSION CTA BANNER */}
      {/* ============================================================ */}
      <section className="w-full py-24 bg-gradient-to-t from-[#13131c] to-[#0a0a0f] relative z-10 border-t border-white/10">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff5e00] to-[#ffb700] text-black flex items-center justify-center font-bold text-3xl mx-auto shadow-2xl shadow-[#ff5e00]/40">
            🍕
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl font-extrabold text-white">
            Ready to Taste Real Perfection?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-lg mx-auto font-light">
            Design your pizza in 4 easy steps, pay in test mode, and track it live from our volcanic stone oven to your doorstep.
          </p>
          <div className="pt-4">
            <Link
              to="/builder"
              className="bg-gradient-to-r from-[#ff5e00] to-[#d92626] hover:from-[#ff6f1a] hover:to-[#e63535] text-white font-bold text-lg py-4 px-10 rounded-2xl shadow-2xl shadow-[#ff5e00]/40 hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <ChefHat className="w-6 h-6" />
              <span>Start Custom Pizza Order</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
