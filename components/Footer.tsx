export default function Footer() {
  return (
    <footer className="border-t border-line mt-32 py-8">
      <div className="mx-auto max-w-5xl px-6 flex items-center justify-between text-xs text-stone">
        <span className="font-mono tracking-wider uppercase">Hejia Geng</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
