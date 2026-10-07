import { NavLink } from 'react-router-dom';
import { MiniCartWidget } from '../remotes/widgets';
import { StatusChips } from '../components/StatusChips';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Início', end: true },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/cart', label: 'Carrinho' },
  { to: '/checkout', label: 'Checkout' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <NavLink
          to="/"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          <span className="text-primary">Micro</span>Store
          <span className="ml-2 rounded-md bg-accent px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-accent-foreground uppercase">
            POC MFE
          </span>
        </NavLink>

        <nav aria-label="Principal" className="flex gap-1 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <StatusChips />
          <MiniCartWidget />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
