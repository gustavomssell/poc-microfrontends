/*
 * Barrel único do design system.
 *
 * Apps importam SEMPRE por aqui (`@microstore/ui`); os primitivos
 * shadcn/ui vivem em ./components/ui e os componentes de domínio em
 * ./components. Nenhum app importa caminho interno do package.
 */

// Primitivos shadcn/ui
export { Button, buttonVariants } from './components/ui/button.tsx';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './components/ui/card.tsx';
export { Badge, badgeVariants } from './components/ui/badge.tsx';
export { Input } from './components/ui/input.tsx';
export { Textarea } from './components/ui/textarea.tsx';
export { Label } from './components/ui/label.tsx';
export { Checkbox } from './components/ui/checkbox.tsx';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/ui/select.tsx';
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './components/ui/field.tsx';
export { Separator } from './components/ui/separator.tsx';
export { Skeleton } from './components/ui/skeleton.tsx';
export { Spinner } from './components/ui/spinner.tsx';
export { Alert, AlertAction, AlertDescription, AlertTitle } from './components/ui/alert.tsx';
export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './components/ui/empty.tsx';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip.tsx';
export { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group.tsx';
export { Toaster } from './components/ui/sonner.tsx';

// Domínio
export { Price } from './components/Price.tsx';
export type { PriceProps } from './components/Price.tsx';
export { formatCurrency, productGradient } from './lib/format.ts';
export { softNavigate } from './lib/navigation.ts';
export { MfeLink } from './components/MfeLink.tsx';
export { cn } from './lib/utils.ts';
