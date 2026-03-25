"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

// Badge component for consistent styling
// Removed unused Badge, statusConfig, roleConfig, colorPalette

// Status badge configurations


import Spreadsheet, { CellBase } from "react-spreadsheet";

// Define the cell type
type SheetCell = CellBase<string | number>;

export default function Sheets({ data, setData }: {
    data: SheetCell[][];
    setData: (_: SheetCell[][]) => void;
}) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Use a microtask to avoid the synchronous setState in effect warning
        Promise.resolve().then(() => setMounted(true));
    }, []);

    const handleDownload = () => {
        // Format data into a 2D array of raw values for the Excel file
        const exportedData = data.map((row) =>
            row.map((cell) => cell?.value ?? "")
        );
        const worksheet = XLSX.utils.aoa_to_sheet(exportedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "lead-gen-data.xlsx");
    };

    return (
        <div className="flex-1 max-h-screen w-1/2 overflow-auto relative">
            <div className="sticky top-0 right-0 z-10 flex justify-end p-2 bg-background/80 backdrop-blur-sm border-b shadow-sm min-w-max">
                <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export to Excel
                </Button>
            </div>
            <div className="min-w-max rounded-b-xl overflow-hidden mt-2">
                <Spreadsheet
                    data={data}
                    onChange={setData as (_: (CellBase | undefined)[][]) => void}
                    // DataViewer={CustomDataViewer}
                    darkMode={mounted ? resolvedTheme === "dark" : false}
                />
            </div>
        </div>
    );
}
