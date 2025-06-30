

"use client";

import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { LoaderCircle, X, Wand2, Send, RefreshCw, FileUp } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";

interface AICompanionPanelProps {
  open: boolean;
  onClose: () => void;
  onForecast: () => Promise<{text: string}>;
  onAnalyze: (query: string) => Promise<ChatMessage>;
  onReset: () => void;
  isLoading: { forecast: boolean, analyze: boolean, summarize: boolean, clean: boolean, import: boolean };
  newMessage: ChatMessage | null;
  onNewMessageConsumed: () => void;
}

const DEMO_SCRIPT = [
  "Hi there, I've just uploaded `q1_sales_report.csv`. Can you clean it up for me? I need capitalization standardized and region names corrected.",
  "Great. Can you create some KPI cards for total revenue, total sales, and average sale value?",
  "Perfect. Now, create a chart showing revenue by region.",
  "That looks good. Now, can you filter the data to show only the 'North' and 'East' regions? I want to compare their performance.",
  "In the main spreadsheet, can you apply conditional formatting to the revenue column? Highlight all values above $17,000 in green.",
  "Interesting. What is the total revenue per product?",
  "Given our current CAC and marketing spend, can you generate a 3-month revenue forecast based on this data?",
  "Thanks. What if we increased marketing spend by 20%? Show me a what-if analysis for that.",
  "Okay, we ran an A/B test on the new checkout flow. Can you show me which variant performed better, considering both conversion rate and the cost per conversion?",
  "Finally, let's set up an automated workflow to sync this data with Salesforce. Add it to the canvas.",
  "This is powerful. I see I can configure the workflow. Can I switch to a faster AI model if I need to?",
];

const initialMessages: ChatMessage[] = [
    {
      sender: 'ai',
      text: "Welcome to the 0str1ch interactive demo! Let's build a dashboard from scratch. Click the prompt below to get started.",
    },
];

export function AIChatPanel({ open, onClose, onForecast, onAnalyze, onReset, isLoading, newMessage, onNewMessageConsumed }: AICompanionPanelProps) {
  const nodeRef = useRef(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [demoStep, setDemoStep] = useState(0);
  const [isResponding, setIsResponding] = useState(false);
  const [selectedModel, setSelectedModel] = useState("0str1ch 1.0");

  const isCurrentlyLoading = isLoading.analyze || isLoading.forecast || isLoading.summarize || isLoading.clean || isLoading.import || isResponding;
  
  useEffect(() => {
    if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        onNewMessageConsumed();
    }
  }, [newMessage, onNewMessageConsumed]);


  const handleSend = async (prompt: string) => {
    if (!prompt.trim() || isCurrentlyLoading) return;

    setIsResponding(true);
    const userMessage: ChatMessage = { sender: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    let aiResponse: ChatMessage;

    if (prompt.toLowerCase().includes('forecast')) {
      const result = await onForecast();
      aiResponse = { sender: 'ai', text: result.text };
    } else {
       aiResponse = await onAnalyze(prompt);
    }

    setMessages((prev) => [...prev, aiResponse]);
    if (demoStep < DEMO_SCRIPT.length) {
      setDemoStep(prev => prev + 1);
    }
    setIsResponding(false);
  };
  
  const handleResetDemo = () => {
    onReset();
    setMessages(initialMessages);
    setDemoStep(0);
  };


  if (!open) return null;

  return (
    <Draggable handle=".drag-handle" nodeRef={nodeRef} cancel=".no-drag">
      <div ref={nodeRef} className="fixed top-20 right-5 z-50">
        <Card className="w-[440px] h-[650px] shadow-2xl flex flex-col overflow-hidden bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between p-3 border-b drag-handle cursor-move">
                <div className="flex items-center gap-2 font-semibold text-sm">
                    <Wand2 className="h-5 w-5 text-primary" />
                    AI Assistant
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 no-drag" onClick={onClose} title="Close">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        {msg.sender === "ai" && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="robot" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        )}
                        <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                            msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                    ))}
                    {isCurrentlyLoading && (
                        <div className="flex justify-start items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="robot" />
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-2xl px-3 py-2">
                                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t space-y-4">
              {demoStep < DEMO_SCRIPT.length ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">CLICK TO SEND NEXT PROMPT:</p>
                  <button
                    onClick={() => handleSend(DEMO_SCRIPT[demoStep])}
                    disabled={isCurrentlyLoading}
                    className="w-full text-left p-3 rounded-lg bg-muted hover:bg-accent/20 transition-colors disabled:opacity-50 flex items-center gap-3 no-drag"
                  >
                    <p className="text-sm flex-1">{DEMO_SCRIPT[demoStep]}</p>
                    <Send className="h-4 w-4 text-primary" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                    <p className="text-sm font-medium">Demo Complete!</p>
                    <p className="text-xs text-muted-foreground mb-3">You can now explore the generated dashboard or restart.</p>
                    <Button variant="outline" size="sm" onClick={handleResetDemo}>
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Restart Demo
                    </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="shrink-0"><FileUp className="h-5 w-5" /></Button>
                  <Input 
                      placeholder="Ask the AI to do something..." 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                      disabled={isCurrentlyLoading}
                      className="no-drag"
                  />
                  <Button onClick={() => handleSend(inputValue)} disabled={isCurrentlyLoading || !inputValue.trim()} className="no-drag"><Send className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center justify-center text-xs text-muted-foreground mt-2 gap-2">
                <span>Powered by</span>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="h-6 text-xs w-auto border-0 bg-transparent p-1 focus:ring-0 focus-visible:ring-offset-0 focus-visible:ring-0 shadow-none no-drag">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0str1ch 1.0">0str1ch 1.0</SelectItem>
                    <SelectItem value="0str1ch mini">0str1ch mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
        </Card>
      </div>
    </Draggable>
  );
}
