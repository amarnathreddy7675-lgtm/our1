export default function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="glass mx-auto mt-10 max-w-lg p-8 text-center">
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="mt-3 text-white/70">This section is built in {phase}.</p>
    </div>
  );
}
