export default function SectionDivider() {
  return (
    <div aria-hidden="true" className="relative mx-auto flex w-full max-w-7xl items-center justify-center px-4">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent dark:via-white/15" />
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center bg-[#F8F9FA] px-3 dark:bg-[#050505]">
        <span className="h-1.5 w-1.5 rotate-45 border border-brand-blue/60 dark:border-[#00D2FF]/60" />
      </div>
    </div>
  );
}
