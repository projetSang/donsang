export function HealthCard({ icon: Icon, title, description, className, value }) {
  return (
    <div className={`bg-card p-6 rounded-xl  border border-border shadow-sm hover:shadow-lg transition-all duration-300 group ${className || ''}`}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {value && (
            <div className="text-3xl font-extrabold text-primary animate-reveal">
              {value}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}