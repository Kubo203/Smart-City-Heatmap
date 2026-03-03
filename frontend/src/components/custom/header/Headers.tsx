// Could extract these if used elsewhere
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <p className="text-2xl lg:text-[30px] font-semibold">{children}</p>
);

const StickyHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="sticky h-fit top-0 z-10 bg-white py-4 lg:px-3 border-b">
    <SectionHeader>{children}</SectionHeader>
  </div>
);

export { SectionHeader, StickyHeader };
