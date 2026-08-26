import { EnquiryForm } from "@/components/enquiry-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 bg-stone-50 px-6 py-16 text-stone-950 sm:px-10 lg:px-16">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
        <section className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold tracking-[0.24em] text-amber-700">
            SPEC HOME
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            The foundation is ready for the SPEC Home platform.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-stone-600">
            A Next.js workspace prepared for the approved design, entity model,
            property discovery, and enquiry flows.
          </p>
          <ul className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
            <li>Next.js App Router + TypeScript</li>
            <li>Tailwind CSS + shadcn/ui</li>
            <li>React Hook Form + Zod validation</li>
            <li>Supabase client configuration</li>
            <li>Optional Google Analytics integration</li>
          </ul>
        </section>
        <Card className="border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle>Enquiry form starter</CardTitle>
          </CardHeader>
          <CardContent>
            <EnquiryForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
