"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { capitalizeEachWord } from "@/utils/capitalize-each-word";

interface DownloadQuestionsButtonProps {
  questions: string[];
  interviewRole: string;
}

export const DownloadQuestionsButton: React.FC<
  DownloadQuestionsButtonProps
> = ({ questions, interviewRole }) => {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load the logo as a data URL when component mounts
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/logo.png");
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    };

    loadLogo();
  }, []);

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      // Dynamically import jsPDF to reduce client bundle size
      const { jsPDF } = await import("jspdf");
      // For better text handling, also import autoTable plugin
      const { default: autoTable } = await import("jspdf-autotable");

      // Create a new PDF document (using A4 format)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Define brand colors with proper typing
      const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
      const secondaryColor: [number, number, number] = [44, 62, 80]; // Dark blue
      const accentColor: [number, number, number] = [52, 152, 219]; // Light blue
      const lightGray: [number, number, number] = [240, 245, 250]; // Light gray for backgrounds
      const darkGray: [number, number, number] = [127, 140, 141]; // Dark gray for text

      // Set page margins
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;

      // Function to add header to each page
      const addHeader = (pageNum: number) => {
        // Add colored header background
        doc.setFillColor(248, 250, 252); // Very light blue/gray
        doc.rect(0, 0, pageWidth, margin + 25, "F");

        // Add logo if available
        if (logoDataUrl) {
          try {
            doc.addImage(logoDataUrl, "SVG", margin, margin, 15, 15);
          } catch (e) {
            console.error("Error adding logo:", e);
            // Fallback: Add a colored rectangle instead
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(margin, margin, 15, 15, "F");
          }
        } else {
          // Fallback: Add a colored rectangle instead
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(margin, margin, 15, 15, "F");
        }

        // Add "VirtIQ" text next to logo
        doc.setFontSize(18);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont("helvetica", "bold");
        doc.text("VirtIQ", margin + 20, margin + 10);

        // Add tagline
        if (pageNum === 1) {
          doc.setFontSize(10);
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.setFont("helvetica", "italic");
          doc.text(
            "Your Virtual Interview Assistant",
            margin + 20,
            margin + 16
          );
        }

        // Add divider line
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 25, pageWidth - margin, margin + 25);
      };

      // Add header to first page
      addHeader(1);

      // Add interview title with decorative element
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(pageWidth / 2 - 60, margin + 35, 120, 8, 4, 4, "F");

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255); // White text on blue background
      doc.setFont("helvetica", "bold");
      doc.text(
        `${capitalizeEachWord(interviewRole)} Interview`,
        pageWidth / 2,
        margin + 41,
        {
          align: "center",
        }
      );

      // Add subtitle
      doc.setFontSize(14);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont("helvetica", "normal");
      doc.text("Interview Questions", pageWidth / 2, margin + 55, {
        align: "center",
      });

      // Add date with icon-like element
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.circle(margin + 4, margin + 65, 2, "F");

      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        margin + 10,
        margin + 65
      );

      // Add a brief description in a box
      doc.setFillColor(248, 250, 252); // Very light blue/gray
      doc.roundedRect(margin, margin + 70, contentWidth, 15, 2, 2, "F");

      doc.setFontSize(10);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(
        "This document contains the questions from your interview session. Use these questions to prepare for future interviews and improve your skills.",
        margin + 5,
        margin + 77,
        {
          maxWidth: contentWidth - 10,
          align: "left",
        }
      );

      // Add questions using autoTable for better formatting
      const tableData = questions.map((question, index) => [
        `${index + 1}`,
        question,
      ]);

      autoTable(doc, {
        startY: margin + 95,
        head: [["#", "Question"]],
        body: tableData,
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          fontSize: 12,
        },
        bodyStyles: {
          fontSize: 11,
          textColor: [50, 50, 50],
          lineColor: [220, 220, 220],
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: lightGray,
        },
        columnStyles: {
          0: {
            cellWidth: 10,
            halign: "center",
            valign: "middle",
            fontStyle: "bold",
          },
          1: {
            cellWidth: "auto",
            halign: "left",
          },
        },
        margin: {
          top: margin,
          right: margin,
          bottom: margin + 10,
          left: margin,
        },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
        styles: {
          overflow: "linebreak",
          cellWidth: "wrap",
        },
        didParseCell: (data) => {
          // Add custom styling to cells if needed
          if (data.section === "body") {
            data.cell.styles.lineWidth = 0.1;
          }
        },
        didDrawPage: (data) => {
          // Add header to each new page
          if (data.pageNumber > 1) {
            addHeader(data.pageNumber);
          }

          // Add footer with page numbers
          const footerY = doc.internal.pageSize.getHeight() - 10;

          // Add divider line above footer
          doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.setLineWidth(0.2);
          doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

          // Add page number
          doc.setFontSize(8);
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.text(
            `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
            margin,
            footerY
          );

          // Add VirtIQ copyright
          doc.text(
            "© VirtIQ - Your Virtual Interview Assistant",
            pageWidth - margin,
            footerY,
            { align: "right" }
          );
        },
      });

      // Save the PDF
      doc.save(
        `VirtIQ-${interviewRole
          .toLowerCase()
          .replace(/\s+/g, "-")}-interview-questions.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="text-sm gap-1.5 h-8 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <Download
              className={`h-3.5 w-3.5 ${isLoading ? "animate-pulse" : ""}`}
            />
            {isLoading ? "Generating..." : "Download Questions"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-black">Download interview questions as PDF</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
