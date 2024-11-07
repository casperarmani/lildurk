import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Shield, BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Your AI Assistant for Smarter Conversations
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Experience the power of AI-driven conversations. Get instant responses, insights, and assistance whenever you need it.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/chat">
                <Button variant="outline" size="lg">Try Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/5 rounded-full">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Smart Conversations</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Engage in natural conversations with our advanced AI assistant
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/5 rounded-full">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Instant Responses</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Get immediate, accurate responses to your questions
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/5 rounded-full">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Secure & Private</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Your conversations are always private and secure
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/5 rounded-full">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Analytics</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Track your usage and conversation history
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}