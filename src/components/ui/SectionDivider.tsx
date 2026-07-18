export default function SectionDivider() {
  return (
    <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent dark:via-brand-blue/30">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[150px] bg-brand-blue blur-[2px]"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[4px] w-[50px] bg-white blur-[4px] dark:bg-brand-blue/80"></div>
    </div>
  );
}
