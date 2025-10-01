"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  convertInchesToTwip,
  PageBreak,
} from "docx";
import { InboxTenderMapping, InboxTenderPart } from "../api/use-tender-inbox-query";
import { getRequirements } from "./compat";

interface GenerateTenderDocxOptions {
  mapping: InboxTenderMapping;
  selectedPart: InboxTenderPart;
  hasMultipleParts: boolean;
}

function generatePartContent(
  part: InboxTenderPart,
  partNumber: number | null,
  mapping: InboxTenderMapping,
  isFirstPart: boolean
): Paragraph[] {
  const sections: Paragraph[] = [];

  // Part Name (if multiple parts and not first part)
  if (partNumber !== null && !isFirstPart) {
    sections.push(
      new Paragraph({
        text: "",
        run: {
          children: [new PageBreak()],
        },
      })
    );
  }

  if (partNumber !== null) {
    sections.push(
      new Paragraph({
        text: `Część ${partNumber}: ${part.part_name || "Bez nazwy"}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: isFirstPart ? 300 : 0, after: 300 },
      })
    );
  }

  // Overview Section
  sections.push(
    new Paragraph({
      text: "Przegląd",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    })
  );

  if (part.can_participate !== undefined) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Czy mogę uczestniczyć: ",
            bold: true,
          }),
          new TextRun({
            text: part.can_participate ? "Tak" : "Nie",
            color: part.can_participate ? "22c55e" : "ef4444",
            bold: true,
          }),
        ],
        spacing: { after: 150 },
      })
    );
  }

  if (part.wadium_llm) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Wadium: ",
            bold: true,
          }),
          new TextRun({
            text: part.wadium_llm,
          }),
        ],
        spacing: { after: 150 },
      })
    );
  }

  if (part.ordercompletiondate_llm) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Data realizacji: ",
            bold: true,
          }),
          new TextRun({
            text: part.ordercompletiondate_llm,
          }),
        ],
        spacing: { after: 150 },
      })
    );
  }

  // Products Section
  if (part.tender_products && part.tender_products.length > 0) {
    sections.push(
      new Paragraph({
        text: "Produkty",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    part.tender_products.forEach((product, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${product.product_req_name || "Produkt bez nazwy"}`,
              bold: true,
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      if (product.product_req_quantity) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "   Ilość: ",
                italics: true,
              }),
              new TextRun({
                text: product.product_req_quantity,
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (product.product_req_spec) {
        sections.push(
          new Paragraph({
            text: `   ${product.product_req_spec}`,
            spacing: { after: 150 },
          })
        );
      }
    });
  }

  // Requirements Section
  const metRequirements = getRequirements("met", part);
  const needsConfirmation = getRequirements("needs_confirmation", part);
  const notMetRequirements = getRequirements("not_met", part);

  if (
    metRequirements.length > 0 ||
    needsConfirmation.length > 0 ||
    notMetRequirements.length > 0
  ) {
    sections.push(
      new Paragraph({
        text: "Wymagania",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    if (metRequirements.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "✓ Spełnione wymagania",
              bold: true,
              color: "22c55e",
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      metRequirements.forEach((req: any) => {
        sections.push(
          new Paragraph({
            text: `   • ${req}`,
            spacing: { after: 80 },
          })
        );
      });
    }

    if (needsConfirmation.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "⚠ Wymaga potwierdzenia",
              bold: true,
              color: "f59e0b",
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      needsConfirmation.forEach((req: any) => {
        sections.push(
          new Paragraph({
            text: `   • ${req}`,
            spacing: { after: 80 },
          })
        );
      });
    }

    if (notMetRequirements.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "✗ Niespełnione wymagania",
              bold: true,
              color: "ef4444",
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      notMetRequirements.forEach((req: any) => {
        sections.push(
          new Paragraph({
            text: `   • ${req}`,
            spacing: { after: 80 },
          })
        );
      });
    }
  }

  // Review Criteria Section
  if (part.review_criteria_llm) {
    sections.push(
      new Paragraph({
        text: "Kryteria oceny",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    try {
      const criteriaArray = JSON.parse(part.review_criteria_llm);
      if (Array.isArray(criteriaArray)) {
        criteriaArray.forEach((criteria: any) => {
          const { kryterium, Cena, waga, opis } = criteria;
          
          if (kryterium) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: kryterium,
                    bold: true,
                  }),
                  new TextRun({
                    text: ` (Waga: ${waga || "brak"})`,
                    italics: true,
                  }),
                ],
                spacing: { before: 100, after: 50 },
              })
            );
          }

          if (opis) {
            sections.push(
              new Paragraph({
                text: `   ${opis}`,
                spacing: { after: 150 },
              })
            );
          }
        });
      } else {
        sections.push(
          new Paragraph({
            text: part.review_criteria_llm,
            spacing: { after: 200 },
          })
        );
      }
    } catch {
      sections.push(
        new Paragraph({
          text: part.review_criteria_llm,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Description Section (part-level)
  const partLevelDescription = part.description_part_long_llm?.trim() || "";
  
  if (partLevelDescription.length > 0) {
    sections.push(
      new Paragraph({
        text: "Opis",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    const descriptionSections = partLevelDescription.split(/##\s+/);
    
    descriptionSections.forEach((section) => {
      if (!section.trim()) return;

      const lines = section.split("\n");
      const sectionTitle = lines[0]?.trim();
      const sectionContent = lines.slice(1).join("\n").trim();

      if (sectionTitle && sectionContent) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sectionTitle,
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        const paragraphs = sectionContent.split("\n\n");
        paragraphs.forEach((para) => {
          if (para.trim()) {
            sections.push(
              new Paragraph({
                text: para.trim(),
                spacing: { after: 150 },
              })
            );
          }
        });
      } else if (sectionTitle) {
        sections.push(
          new Paragraph({
            text: sectionTitle,
            spacing: { after: 150 },
          })
        );
      }
    });
  }

  // Payment terms at part level
  if (part.payment_terms_llm) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Warunki płatności",
            bold: true,
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        text: part.payment_terms_llm,
        spacing: { after: 200 },
      })
    );
  }

  return sections;
}

export async function generateTenderDocx({
  mapping,
  selectedPart,
  hasMultipleParts,
}: GenerateTenderDocxOptions): Promise<Blob> {
  const allSections: Paragraph[] = [];

  // Title
  allSections.push(
    new Paragraph({
      text: mapping.tenders?.order_object || "Dokument przetargu",
      heading: HeadingLevel.TITLE,
      spacing: {
        after: 300,
        before: 0,
      },
    })
  );

  // Organization Info
  if (mapping.tenders?.organization_name) {
    allSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Organizacja: ",
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: mapping.tenders.organization_name,
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  // Deadline
  if (mapping.tenders?.submitting_offers_date) {
    allSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Termin składania ofert: ",
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: new Date(mapping.tenders.submitting_offers_date).toLocaleDateString(
              "pl-PL",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  // Voivodeship
  if (mapping.tenders?.voivodship) {
    allSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Województwo: ",
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: mapping.tenders.voivodship,
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  // URL
  if (mapping.tenders?.url) {
    allSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "URL: ",
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: mapping.tenders.url,
            color: "0563C1",
            underline: {},
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // Generate content for all parts if there are multiple parts
  if (hasMultipleParts) {
    // Get participating parts
    const participatingParts = mapping.tender_parts.filter(
      (p) => p.can_participate
    );

    participatingParts.forEach((part, index) => {
      const partContent = generatePartContent(
        part,
        index + 1,
        mapping,
        index === 0
      );
      allSections.push(...partContent);
    });
  } else {
    // Single part - just generate without part number
    const partContent = generatePartContent(selectedPart, null, mapping, true);
    allSections.push(...partContent);
  }

  // Tender-level description (only if no parts have descriptions or single part)
  const tenderLevelDescription = mapping.tenders?.description_long_llm || "";
  const anyPartHasDescription = mapping.tender_parts.some(
    (p) => p.description_part_long_llm?.trim()
  );

  if (tenderLevelDescription.trim().length > 0 && (!hasMultipleParts || !anyPartHasDescription)) {
    allSections.push(
      new Paragraph({
        text: "Opis ogólny",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const descriptionSections = tenderLevelDescription.split(/##\s+/);
    
    descriptionSections.forEach((section) => {
      if (!section.trim()) return;

      const lines = section.split("\n");
      const sectionTitle = lines[0]?.trim();
      const sectionContent = lines.slice(1).join("\n").trim();

      if (sectionTitle && sectionContent) {
        allSections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sectionTitle,
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        const paragraphs = sectionContent.split("\n\n");
        paragraphs.forEach((para) => {
          if (para.trim()) {
            allSections.push(
              new Paragraph({
                text: para.trim(),
                spacing: { after: 150 },
              })
            );
          }
        });
      } else if (sectionTitle) {
        allSections.push(
          new Paragraph({
            text: sectionTitle,
            spacing: { after: 150 },
          })
        );
      }
    });
  }

  // Additional Information Section (tender-level)
  const hasAdditionalInfo =
    mapping.tenders?.payment_terms_llm ||
    mapping.tenders?.contract_penalties_llm ||
    mapping.tenders?.deposit_llm;

  if (hasAdditionalInfo) {
    allSections.push(
      new Paragraph({
        text: "Informacje dodatkowe",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    if (mapping.tenders?.payment_terms_llm) {
      allSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Warunki płatności",
              bold: true,
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );
      allSections.push(
        new Paragraph({
          text: mapping.tenders.payment_terms_llm,
          spacing: { after: 200 },
        })
      );
    }

    if (mapping.tenders?.contract_penalties_llm) {
      allSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Kary umowne",
              bold: true,
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );
      allSections.push(
        new Paragraph({
          text: mapping.tenders.contract_penalties_llm,
          spacing: { after: 200 },
        })
      );
    }

    if (mapping.tenders?.deposit_llm) {
      allSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Wadium",
              bold: true,
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );
      allSections.push(
        new Paragraph({
          text: mapping.tenders.deposit_llm,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: allSections,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

export function downloadTenderDocx(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
