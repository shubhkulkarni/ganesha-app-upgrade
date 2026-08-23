import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { DecorativePattern } from "@/components/decorative-pattern"
import { createDonation } from "@/services/createDonation"
import { getCurrentUser } from "@/lib/auth"
import { usePdf } from "@/lib/pdf/use-pdf"
import { currentYearKey, usePaymentsQuery } from "@/hooks/use-payments"
import { DonationForm } from "./DonationForm"
import { RecentDonationsList } from "./RecentDonationsList"
import { donationSchema, getReceiptNo, type DonationFormValues } from "./schema"

const emptyValues = (receiptNo: string): DonationFormValues => ({
  receiptNo,
  date: new Date(),
  name: "",
  amount: "",
  otherDonation: "",
  mobile: "",
  payment: "" as DonationFormValues["payment"],
})

export default function DonatePage() {
  const yearKey = currentYearKey()
  const { data: payments = [], isLoading, isFetching } = usePaymentsQuery(yearKey)
  const queryClient = useQueryClient()
  const generatePdf = usePdf()

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: emptyValues(getReceiptNo()),
  })

  useEffect(() => {
    if (!isLoading) {
      form.setValue("receiptNo", getReceiptNo(payments[0]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, payments])

  const onSubmit = async (values: DonationFormValues) => {
    try {
      const mobile = values.mobile?.trim() ? values.mobile.trim() : "Not disclosed"
      if (values.mobile?.trim() && (mobile.length !== 10 || Number.isNaN(Number(mobile)))) {
        toast.error("Mobile no. is invalid")
        return
      }

      const savedRecord = {
        ...values,
        amount: values.payment === "Other" ? 0 : Number(values.amount),
        otherDonation: values.payment === "Other" ? values.otherDonation : "",
        mobile,
        receivedBy: getCurrentUser(),
      }

      await createDonation(savedRecord)
      await queryClient.invalidateQueries({ queryKey: ["payments", yearKey] })

      // Generate the receipt from the record that was actually saved, not stale pre-submit state.
      generatePdf(savedRecord)

      toast.success("Your donation is successful !")
      form.reset(emptyValues(getReceiptNo({ receiptNo: values.receiptNo })))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/20 via-secondary/60 to-background py-6">
        <DecorativePattern className="text-primary opacity-[0.16] dark:opacity-[0.22]" />
        <CardContent className="relative space-y-2 text-center">
          <h1 className="font-hero text-xl leading-tight tracking-wide text-balance sm:text-2xl md:text-3xl">
            <span className="text-gradient-hero">।। श्री ढुंढिराज टेंबे गणेश मंडळ ।।</span>
          </h1>
          <p className="font-devanagari mx-auto max-w-3xl text-xs leading-relaxed text-foreground/80 sm:text-sm">
            एकदंतं चतुर्हस्तं पाशमंकुशधारिणम। रदं च वरदं हस्तैर्विभ्राणं मूषकध्वजम। रक्तं लंबोदरं शूर्पकर्णकं
            रक्तवाससम। रक्तगंधाऽनुलिप्तांगं रक्तपुष्पै: सुपुजितम।।
            <br />
            भक्तानुकंपिनं देवं जगत्कारणमच्युतम । आविर्भूतं च सृष्टयादौ प्रकृते पुरुषात्परम । एवं ध्यायति यो
            नित्यं स योगी योगिनां वर:।।
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Donate</CardTitle>
            <CardDescription>Please fill all the mandatory fields</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <DonationForm form={form} />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset(emptyValues(form.getValues("receiptNo")))}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                      <Save className="size-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card className="card-lift">
          <CardHeader>
            <CardTitle className="font-display text-xl">Recent payments</CardTitle>
            <CardDescription>Click to download receipts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || isFetching ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <RecentDonationsList donations={payments} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
