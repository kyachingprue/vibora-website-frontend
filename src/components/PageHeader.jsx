export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
