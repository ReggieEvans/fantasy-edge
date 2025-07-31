const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 text-foreground">
        <div className="flex justify-center py-4">
         Logo
        </div>
        {children}
      </div>
    </main>
  );
};

export default Layout;