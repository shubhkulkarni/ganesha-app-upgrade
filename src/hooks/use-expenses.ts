import { useQuery } from "@tanstack/react-query"
import { loadExpensesService } from "@/services/expenseService"

export function useExpensesQuery() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: () => loadExpensesService(),
  })
}
