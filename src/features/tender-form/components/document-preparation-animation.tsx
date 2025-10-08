"use client";

import { motion } from "motion/react";
import {
  FileSearch,
  Building2,
  FileSpreadsheet,
  Wrench,
  ShieldCheck,
  FileText,
  Award,
  AlignLeft,
  GitCompare,
  CheckCircle2,
  FolderCheck,
  Package,
} from "lucide-react";
import { cn } from "$/lib/utils";

const preparationSteps = [
  <>
    <FileSearch className="inline-block w-4 h-4 mr-2 text-primary" />
    Analyzing tender requirements...
  </>,
  <>
    <Building2 className="inline-block w-4 h-4 mr-2 text-primary" />
    Extracting company information...
  </>,
  <>
    <FileSpreadsheet className="inline-block w-4 h-4 mr-2 text-primary" />
    Generating financial documentation...
  </>,
  <>
    <Wrench className="inline-block w-4 h-4 mr-2 text-primary" />
    Compiling technical specifications...
  </>,
  <>
    <ShieldCheck className="inline-block w-4 h-4 mr-2 text-primary" />
    Verifying compliance requirements...
  </>,
  <>
    <FileText className="inline-block w-4 h-4 mr-2 text-primary" />
    Creating executive summary...
  </>,
  <>
    <Award className="inline-block w-4 h-4 mr-2 text-primary" />
    Attaching certificates and qualifications...
  </>,
  <>
    <AlignLeft className="inline-block w-4 h-4 mr-2 text-primary" />
    Formatting proposal documents...
  </>,
  <>
    <GitCompare className="inline-block w-4 h-4 mr-2 text-primary" />
    Cross-referencing tender criteria...
  </>,
  <>
    <CheckCircle2 className="inline-block w-4 h-4 mr-2 text-primary" />
    Validating document completeness...
  </>,
  <>
    <FolderCheck className="inline-block w-4 h-4 mr-2 text-primary" />
    Organizing submission structure...
  </>,
  <>
    <Package className="inline-block w-4 h-4 mr-2 text-primary" />
    Finalizing application package...
  </>,
];

export function DocumentPreparationAnimation({
  className,
}: {
  className?: string;
}) {
  const allSteps = [...preparationSteps, ...preparationSteps];

  const itemHeight = 24;
  const gapHeight = 12; // gap-3 is 12px
  const totalItemHeight = itemHeight + gapHeight;
  const scrollDistance = preparationSteps.length * totalItemHeight;

  return (
    <div
      className={cn(
        "w-full h-[200px] flex items-center relative overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sidebar to-transparent z-10 pointer-events-none" />

      <div className="relative h-full overflow-hidden py-16">
        <motion.div
          className="flex flex-col gap-3"
          animate={{
            y: [0, -scrollDistance],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          {allSteps.map((step, index) => (
            <div
              key={index}
              className="text-sm font-medium text-muted-foreground whitespace-nowrap px-1 leading-5"
              style={{ height: itemHeight }}
            >
              {step}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sidebar to-transparent z-10 pointer-events-none" />
    </div>
  );
}
