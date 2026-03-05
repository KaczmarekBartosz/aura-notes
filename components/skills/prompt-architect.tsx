'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { 
  Wand2, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check,
  Sparkles,
  FileText,
  Target,
  BookOpen,
  Lightbulb,
  ListOrdered,
  MessageSquare,
  CheckCircle2,
  Palette
} from 'lucide-react';

type SectionKey = 'task' | 'context' | 'reference' | 'blueprint' | 'success' | 'rules' | 'conversation' | 'plan';

interface PromptSection {
  key: SectionKey;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

const SECTIONS: PromptSection[] = [
  { key: 'task', label: 'Task', color: 'bg-red-500', icon: <Target className="w-4 h-4" />, description: 'Clear objective + success criteria' },
  { key: 'context', label: 'Context', color: 'bg-blue-500', icon: <BookOpen className="w-4 h-4" />, description: 'Files to read before responding' },
  { key: 'reference', label: 'Reference', color: 'bg-teal-500', icon: <FileText className="w-4 h-4" />, description: 'Example to reverse-engineer' },
  { key: 'blueprint', label: 'Blueprint', color: 'bg-yellow-500', icon: <Lightbulb className="w-4 h-4" />, description: 'What makes it work' },
  { key: 'success', label: 'Success', color: 'bg-amber-500', icon: <CheckCircle2 className="w-4 h-4" />, description: 'Type, length, tone, reaction' },
  { key: 'rules', label: 'Rules', color: 'bg-pink-500', icon: <Palette className="w-4 h-4" />, description: 'Constraints and landmines' },
  { key: 'conversation', label: 'Conversation', color: 'bg-purple-500', icon: <MessageSquare className="w-4 h-4" />, description: 'Questions before execution' },
  { key: 'plan', label: 'Plan', color: 'bg-red-500', icon: <ListOrdered className="w-4 h-4" />, description: 'Execution steps (max 5)' },
];

interface FormData {
  task: {
    objective: string;
    successCriteria: string;
  };
  context: {
    files: string;
  };
  reference: {
    example: string;
  };
  blueprint: {
    patterns: string;
  };
  success: {
    typeAndLength: string;
    recipientReaction: string;
    doesNotSoundLike: string;
    successMeans: string;
  };
  rules: {
    constraints: string;
  };
  conversation: {
    questions: string;
  };
  plan: {
    steps: string;
  };
}

const DEFAULT_FORM_DATA: FormData = {
  task: { objective: '', successCriteria: '' },
  context: { files: '' },
  reference: { example: '' },
  blueprint: { patterns: '' },
  success: { 
    typeAndLength: '', 
    recipientReaction: '', 
    doesNotSoundLike: '', 
    successMeans: '' 
  },
  rules: { constraints: '' },
  conversation: { questions: '' },
  plan: { steps: '' },
};

export function PromptArchitectSkill() {
  const { isGlass } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const updateField = useCallback((section: SectionKey, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const generatePrompt = useCallback(() => {
    const sections: string[] = [];

    // Task
    if (formData.task.objective) {
      sections.push(`I want to ${formData.task.objective}${formData.task.successCriteria ? ` so that ${formData.task.successCriteria}` : ''}.`);
    }

    // Context
    if (formData.context.files) {
      sections.push(`\nFirst, read these files completely before responding:\n\n${formData.context.files}`);
    }

    // Reference
    if (formData.reference.example) {
      sections.push(`\nHere is a reference to what I want to achieve:\n\n${formData.reference.example}`);
    }

    // Blueprint
    if (formData.blueprint.patterns) {
      sections.push(`\nHere's what makes this reference work:\n\n${formData.blueprint.patterns}`);
    }

    // Success Brief
    const successParts: string[] = [];
    if (formData.success.typeAndLength) successParts.push(`Type of output + length:\n${formData.success.typeAndLength}`);
    if (formData.success.recipientReaction) successParts.push(`Recipient's reaction:\n${formData.success.recipientReaction}`);
    if (formData.success.doesNotSoundLike) successParts.push(`Does NOT sound like:\n${formData.success.doesNotSoundLike}`);
    if (formData.success.successMeans) successParts.push(`Success means:\n${formData.success.successMeans}`);
    
    if (successParts.length > 0) {
      sections.push(`\nHere's what I need for my version:\n\nSUCCESS BRIEF\n${successParts.join('\n\n')}`);
    }

    // Rules
    if (formData.rules.constraints) {
      sections.push(`\nMy context file contains my standards, constraints, landmines, and audience. ${formData.rules.constraints}`);
    }

    // Conversation
    if (formData.conversation.questions) {
      sections.push(`\nDO NOT start executing yet. Instead, ask me clarifying questions so we can refine the approach together step by step.\n\nSpecific questions:\n${formData.conversation.questions}`);
    } else {
      sections.push(`\nDO NOT start executing yet. Instead, ask me clarifying questions so we can refine the approach together step by step.`);
    }

    // Plan
    if (formData.plan.steps) {
      sections.push(`\nThen give me your execution plan (5 steps maximum):\n${formData.plan.steps}\n\nOnly begin work once we've aligned.`);
    } else {
      sections.push(`\nThen give me your execution plan (5 steps maximum).\nOnly begin work once we've aligned.`);
    }

    setGeneratedPrompt(sections.join('\n'));
    setShowPreview(true);
  }, [formData]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedPrompt]);

  const reset = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentStep(0);
    setGeneratedPrompt('');
    setShowPreview(false);
  }, []);

  const currentSection = SECTIONS[currentStep];
  const isLastStep = currentStep === SECTIONS.length - 1;
  const isFirstStep = currentStep === 0;

  const renderStepContent = () => {
    switch (currentSection.key) {
      case 'task':
        return (
          <div className="space-y-4">
            <div>
              <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
                What do you want to achieve?
              </label>
              <Textarea
                placeholder="e.g., write a cold outreach email to CTOs at Series B startups"
                value={formData.task.objective}
                onChange={(e) => updateField('task', 'objective', e.target.value)}
                className={cn(
                  "min-h-[100px] resize-none",
                  isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
                )}
              />
            </div>
            <div>
              <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
                Success criteria (so that...)
              </label>
              <Textarea
                placeholder="e.g., I get a 20%+ reply rate and book 5 discovery calls per week"
                value={formData.task.successCriteria}
                onChange={(e) => updateField('task', 'successCriteria', e.target.value)}
                className={cn(
                  "min-h-[100px] resize-none",
                  isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
                )}
              />
            </div>
          </div>
        );
      
      case 'context':
        return (
          <div className="space-y-4">
            <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
              Files to read (one per line, with descriptions)
            </label>
            <Textarea
              placeholder={`[products/ai-analytics.md] — Our product features and pricing\n[icp/cto-persona.md] — Pain points and language CTOs use\n[campaigns/march-2026.md] — Current campaign theme`}
              value={formData.context.files}
              onChange={(e) => updateField('context', 'files', e.target.value)}
              className={cn(
                "min-h-[200px] resize-none font-mono text-sm",
                isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
              )}
            />
          </div>
        );
      
      case 'reference':
        return (
          <div className="space-y-4">
            <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
              Reference example (paste content or describe)
            </label>
            <Textarea
              placeholder={`Paste here the example output you want to reverse-engineer. This could be:\n• A winning email that got great results\n• A document template you admire\n• A landing page copy that converts\n• Any reference material that shows the style/quality you want`}
              value={formData.reference.example}
              onChange={(e) => updateField('reference', 'example', e.target.value)}
              className={cn(
                "min-h-[250px] resize-none",
                isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
              )}
            />
          </div>
        );
      
      case 'blueprint':
        return (
          <div className="space-y-4">
            <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
              What makes this reference work? (Always/Never rules)
            </label>
            <Textarea
              placeholder={`Always open with a specific observation about their company.\nAlways tie the observation to a business outcome they care about.\nAlways include a specific, time-bound ask.\n\nNever use buzzwords like "leverage" or "synergy".\nNever write more than 120 words.\nNever include more than one link.`}
              value={formData.blueprint.patterns}
              onChange={(e) => updateField('blueprint', 'patterns', e.target.value)}
              className={cn(
                "min-h-[250px] resize-none",
                isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
              )}
            />
          </div>
        );
      
      case 'success':
        return (
          <div className="space-y-4">
            <div>
              <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
                Type of output + length
              </label>
              <Input
                placeholder="e.g., Cold email, 80-120 words"
                value={formData.success.typeAndLength}
                onChange={(e) => updateField('success', 'typeAndLength', e.target.value)}
                className={cn(
                  isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
                )}
              />
            </div>
            <div>
              <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
                Recipient&apos;s reaction (what should they think/feel/do?)
              </label>
              <Input
                placeholder='e.g., "This person did their research and understands my problem. Worth a call."'
                value={formData.success.recipientReaction}
                onChange={(e) => updateField('success', 'recipientReaction', e.target.value)}
                className={cn(
                  isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
                )}
              />
            </div>
            <div>
              <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
                Does NOT sound like (anti-patterns to avoid)
              </label>
              <Input
                placeholder="e.g., Generic AI templates, overly formal business speak"
                value={formData.success.doesNotSoundLike}
                onChange={(e) => updateField('success', 'doesNotSoundLike', e.target.value)}
                className={cn(
                  isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
                )}
              />
            </div>
            <div>
              <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
                Success means (concrete end state)
              </label>
              <Input
                placeholder="e.g., They reply with 'Tell me more' or book a call"
                value={formData.success.successMeans}
                onChange={(e) => updateField('success', 'successMeans', e.target.value)}
                className={cn(
                  isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
                )}
              />
            </div>
          </div>
        );
      
      case 'rules':
        return (
          <div className="space-y-4">
            <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
              Constraints and landmines
            </label>
            <Textarea
              placeholder={`Read it fully before starting. If you're about to break one of my rules, stop and tell me.\n\nKey constraints:\n• Follow company's decision doc format\n• Use specific data points, not vague claims\n• Keep under 3 pages for executive consumption`}
              value={formData.rules.constraints}
              onChange={(e) => updateField('rules', 'constraints', e.target.value)}
              className={cn(
                "min-h-[200px] resize-none",
                isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
              )}
            />
          </div>
        );
      
      case 'conversation':
        return (
          <div className="space-y-4">
            <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
              Clarifying questions (optional - leave empty for default)
            </label>
            <Textarea
              placeholder={`What specific companies should I research?\nWhat's your preferred tone: casual or formal?\nDo you have any specific metrics to highlight?`}
              value={formData.conversation.questions}
              onChange={(e) => updateField('conversation', 'questions', e.target.value)}
              className={cn(
                "min-h-[200px] resize-none",
                isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
              )}
            />
          </div>
        );
      
      case 'plan':
        return (
          <div className="space-y-4">
            <label className={cn("block text-sm mb-2", isGlass ? "font-medium" : "font-bold uppercase tracking-wider")}>
              Execution steps (max 5, one per line)
            </label>
            <Textarea
              placeholder={`1) Read all context files\n2) Outline key points and structure\n3) Draft the content following the blueprint\n4) Review against success criteria\n5) Finalize and present`}
              value={formData.plan.steps}
              onChange={(e) => updateField('plan', 'steps', e.target.value)}
              className={cn(
                "min-h-[200px] resize-none",
                isGlass ? "glass-input" : "rounded-none border-2 border-foreground"
              )}
            />
          </div>
        );
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 transition-all duration-200",
          isGlass
            ? "glass-button rounded-full text-sm font-medium hover:scale-105"
            : "bg-foreground text-background font-black uppercase tracking-wider text-xs shadow-[4px_4px_0_var(--primary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--primary)]"
        )}
      >
        <Wand2 className="w-4 h-4" />
        <span>Prompt Architect</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col",
        isGlass
          ? "glass-card rounded-3xl"
          : "bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)]"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 shrink-0",
          isGlass ? "border-b border-[var(--glass-border)]" : "border-b-4 border-foreground bg-muted/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2",
              isGlass ? "glass-badge rounded-xl" : "bg-primary text-primary-foreground"
            )}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={cn(
                "text-lg",
                isGlass ? "font-semibold tracking-tight" : "font-black uppercase tracking-tight"
              )}>
                Prompt Architect
              </h2>
              <p className={cn(
                "text-xs opacity-60",
                isGlass ? "font-medium" : "font-bold uppercase tracking-wider"
              )}>
                8-section anatomy framework
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className={isGlass ? "text-xs" : "font-bold uppercase text-xs"}
              >
                Reset
              </Button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                "p-2 transition-colors",
                isGlass ? "hover:bg-white/10 rounded-full" : "hover:bg-muted"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!showPreview ? (
          <>
            {/* Progress Bar */}
            <div className="px-6 pt-4 shrink-0">
              <div className={cn(
                "flex gap-1 mb-4",
                isGlass ? "" : "px-2"
              )}>
                {SECTIONS.map((section, idx) => (
                  <button
                    key={section.key}
                    onClick={() => setCurrentStep(idx)}
                    className={cn(
                      "flex-1 h-2 transition-all duration-300",
                      isGlass ? "rounded-full" : "",
                      idx <= currentStep ? section.color : "bg-muted/30"
                    )}
                    title={section.label}
                  />
                ))}
              </div>
              
              {/* Section Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-white",
                  currentSection.color,
                  isGlass ? "rounded-full" : ""
                )}>
                  {currentSection.icon}
                  <span className="text-sm font-medium">{currentSection.label}</span>
                </div>
                <span className={cn(
                  "text-sm opacity-60",
                  isGlass ? "font-medium" : "font-bold uppercase tracking-wider"
                )}>
                  {currentSection.description}
                </span>
                <span className="ml-auto text-xs opacity-40">
                  {currentStep + 1} / {SECTIONS.length}
                </span>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className={cn(
              "flex items-center justify-between p-4 shrink-0",
              isGlass ? "border-t border-[var(--glass-border)]" : "border-t-4 border-foreground bg-muted/10"
            )}>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={isFirstStep}
                className={cn(
                  isGlass ? "glass-button" : "rounded-none border-2 border-foreground",
                  "disabled:opacity-30"
                )}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              
              <div className="flex gap-2">
                {isLastStep ? (
                  <Button
                    onClick={generatePrompt}
                    className={cn(
                      isGlass
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                        : "bg-foreground text-background font-black uppercase tracking-wider shadow-[4px_4px_0_var(--primary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--primary)]"
                    )}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Prompt
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep(prev => Math.min(SECTIONS.length - 1, prev + 1))}
                    className={cn(
                      isGlass
                        ? "glass-button bg-primary/10"
                        : "bg-primary text-primary-foreground font-bold uppercase"
                    )}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Preview */
          <>
            <div className={cn(
              "flex items-center justify-between px-6 py-3 shrink-0",
              isGlass ? "border-b border-[var(--glass-border)]" : "border-b-4 border-foreground bg-muted/30"
            )}>
              <h3 className={cn(
                "text-sm",
                isGlass ? "font-semibold" : "font-black uppercase tracking-wider"
              )}>
                Generated Prompt
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className={isGlass ? "glass-button text-xs" : "text-xs font-bold uppercase"}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  className={cn(
                    isGlass
                      ? "bg-primary text-primary-foreground rounded-full text-xs"
                      : "bg-foreground text-background font-bold uppercase text-xs shadow-[3px_3px_0_var(--primary)]"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className={cn(
                "whitespace-pre-wrap text-sm leading-relaxed p-4 overflow-x-auto",
                isGlass
                  ? "glass-input font-mono text-xs"
                  : "bg-muted/10 border-2 border-foreground font-mono text-xs"
              )}>
                {generatedPrompt}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
