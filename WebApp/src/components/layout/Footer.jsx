export default function Footer() {
  return (
    <footer className="bg-brand-gray-light/60 border-t border-border">
      <div className="container-chrome py-4 flex flex-col items-center gap-3">
        <img
          src="/assets/Logos/BTS-Logo.svg"
          alt="Bureau of Transportation Statistics"
          className="h-12 w-auto"
        />
        <p className="text-base text-text-secondary text-center">
          Data source: Bureau of Transportation Statistics (BTS) TransBorder Freight Data, 1993–2025
        </p>
      </div>
    </footer>
  )
}
