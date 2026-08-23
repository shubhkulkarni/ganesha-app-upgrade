import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { SortableHead } from "@/components/data-table/SortableHead"
import { AnimatedNumber } from "@/components/animated-number"
import { useExpensesQuery } from "@/hooks/use-expenses"
import { saveExpensesService } from "@/services/expenseService"
import { useSortableRows } from "@/lib/use-sortable-rows"
import { ExpenseForm } from "./ExpenseForm"
import { emptyExpense, expenseSchema, type ExpenseFormValues } from "./schema"
import type { Expense } from "@/types"

const currentYear = new Date().getFullYear()

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpensesQuery()
  const queryClient = useQueryClient()
  const { sorted, sortKey, direction, toggleSort } = useSortableRows<Expense>(expenses, "expDate")

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: emptyExpense(),
  })

  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.expAmount), 0)

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      await saveExpensesService({ ...values, expAmount: Number(values.expAmount) })
      await queryClient.invalidateQueries({ queryKey: ["expenses"] })
      form.reset(emptyExpense())
      toast.success("Expense saved successfully")
    } catch {
      toast.error("Error saving expense.. Please try after sometime.")
    }
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Expenses of {currentYear}</CardTitle>
          <CardDescription>Add expenses for this year ex. Decoration, Food etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ExpenseForm form={form} />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving expense..." : "Save expense"}
                <Save className="size-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Total {currentYear} Expenses:{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={totalExpenses} formatter={(n) => Math.round(n).toString()} /> ₹
            </span>
          </CardTitle>
          <CardDescription>Total expenses done till date</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !expenses.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No expenses recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead label="Expense" active={sortKey === "expDescription"} direction={direction} onClick={() => toggleSort("expDescription")} />
                    <SortableHead label="Depositor details" active={sortKey === "depositor"} direction={direction} onClick={() => toggleSort("depositor")} />
                    <SortableHead label="Recepient details" active={sortKey === "recepient"} direction={direction} onClick={() => toggleSort("recepient")} />
                    <SortableHead label="Amount" active={sortKey === "expAmount"} direction={direction} onClick={() => toggleSort("expAmount")} align="right" />
                    <SortableHead label="Date" active={sortKey === "expDate"} direction={direction} onClick={() => toggleSort("expDate")} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="font-medium whitespace-nowrap">{row.expDescription}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.depositor}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.recepient}</TableCell>
                      <TableCell className="text-right tabular-nums whitespace-nowrap">{row.expAmount}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.expDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
