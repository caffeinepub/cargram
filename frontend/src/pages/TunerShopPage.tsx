import { MapPin, Phone, Instagram, Wrench, Zap, Settings, RotateCcw, Cpu, Gauge, GitMerge } from 'lucide-react';
import { SiInstagram } from 'react-icons/si';

const services = [
  { icon: Wrench, label: 'Honda & Acura Performance' },
  { icon: GitMerge, label: 'Custom Engine Swaps' },
  { icon: RotateCcw, label: 'Full & Partial Engine Rebuilds' },
  { icon: Settings, label: 'Custom Modifications & Vehicle Customization' },
  { icon: Cpu, label: 'ECU Chipping & Engine Management' },
  { icon: Gauge, label: 'Dyno Tuning & Street Tuning' },
  { icon: Zap, label: 'Transmission Rebuilds & Drivetrain Services' },
];

export default function TunerShopPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img
          src="/assets/generated/tuner-shop-hero.dim_1920x600.jpg"
          alt="Altered Imports — Performance Automotive Shop"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2">Performance Automotive</p>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-white tracking-widest uppercase drop-shadow-lg">
            Altered Imports
          </h1>
          <p className="mt-3 text-white/80 text-sm md:text-base font-medium tracking-wide max-w-md">
            Honda &amp; Acura Specialists · Wenatchee, WA
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-10">

        {/* About / Mission */}
        <section>
          <h2 className="font-heading text-lg font-bold text-primary tracking-widest uppercase mb-3">About Us</h2>
          <p className="text-foreground/85 leading-relaxed text-sm md:text-base">
            Altered Imports is a performance-focused automotive shop built for enthusiasts who demand more from their cars.
            We specialize in Honda and Acura platforms, delivering everything from stock rebuilds to full custom motor swaps,
            precision tuning, and complete drivetrain solutions.
          </p>
          <p className="mt-4 text-foreground/85 leading-relaxed text-sm md:text-base">
            Our mission is simple: build reliable, powerful, and personalized vehicles that match our customers' vision—whether
            that's a clean daily driver, a street-focused build, or a track-ready setup. We combine hands-on experience with
            modern tuning technology to deliver real, measurable results.
          </p>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Services */}
        <section>
          <h2 className="font-heading text-lg font-bold text-primary tracking-widest uppercase mb-5">
            What We Specialize In
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {services.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm md:text-base font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Closing paragraph */}
        <section>
          <p className="text-foreground/85 leading-relaxed text-sm md:text-base">
            From precise ECU calibration to complete powertrain transformations, every build at Altered Imports is handled
            with attention to detail, reliability, and performance-first thinking. We don't believe in shortcuts—only clean
            work, proven setups, and honest results.
          </p>
          <p className="mt-4 text-foreground/85 leading-relaxed text-sm md:text-base">
            Whether you're upgrading, rebuilding, or starting from scratch, Altered Imports is where passion meets precision.
          </p>
        </section>

        {/* Tagline */}
        <section className="text-center py-4">
          <p className="font-heading text-2xl md:text-3xl font-black text-primary tracking-widest uppercase">
            Build different. Build altered.
          </p>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Location & Contact */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          {/* Location */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
            <h3 className="font-heading text-sm font-bold text-primary tracking-widest uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <p className="text-foreground font-medium text-base">Wenatchee</p>
          </div>

          {/* Contact */}
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
            <h3 className="font-heading text-sm font-bold text-primary tracking-widest uppercase flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://www.instagram.com/mr.altered"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground/85 hover:text-primary transition-colors text-sm font-medium"
              >
                <SiInstagram className="w-4 h-4 text-primary flex-shrink-0" />
                @mr.altered
              </a>
              <a
                href="tel:509-679-1389"
                className="flex items-center gap-2 text-foreground/85 hover:text-primary transition-colors text-sm font-medium"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                509-679-1389
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
