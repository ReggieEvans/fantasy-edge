import Image from 'next/image'

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl p-8 text-foreground">
        <div className="flex justify-center py-4">
          <Image src="/fantasyedge-logo-300-91.png" alt="Logo" width={300} height={91} />
        </div>
        {children}
      </div>
    </main>
  )
}

export default Layout
