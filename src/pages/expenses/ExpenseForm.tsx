import type { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import type { ExpenseFormValues } from "./schema"

interface ExpenseFormProps {
  form: UseFormReturn<ExpenseFormValues>
}

export function ExpenseForm({ form }: ExpenseFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="expDescription"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Expense description</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input type="number" className="pl-7" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {field.value ? format(field.value, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} autoFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="depositor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Depositor details</FormLabel>
            <FormControl>
              <Input placeholder="Name, mobile, address etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="recepient"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recepient details</FormLabel>
            <FormControl>
              <Input placeholder="Name, mobile, address etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
