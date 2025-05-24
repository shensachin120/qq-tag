export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} StickerFind. All rights reserved.</p>
        <p className="text-sm mt-1">Helping you recover your lost items.</p>
      </div>
    </footer>
  );
}
