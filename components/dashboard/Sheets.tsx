"use client";

import React, { useState } from "react";
import Spreadsheet, { CellBase, DataViewerProps } from "react-spreadsheet";
import { Star, Check } from "lucide-react";

// Badge component for consistent styling
const Badge = ({
    children,
    color,
    textColor = "white",
}: {
    children: React.ReactNode;
    color: string;
    textColor?: string;
}) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
        style={{ color: textColor === "white" ? "#fff" : textColor }}
    >
        {children}
    </span>
);

// Status badge configurations
const statusConfig: Record<string, { color: string; label: string; icon?: React.ReactNode }> = {
    verified: {
        color: "bg-emerald-500",
        label: "Verified",
        icon: <span className="w-2 h-2 rounded-full bg-white mr-1" />,
    },
    not_verified: {
        color: "bg-red-500",
        label: "Not Verified",
        icon: <span className="w-2 h-2 rounded-full bg-white mr-1" />,
    },
    approved: {
        color: "bg-blue-500",
        label: "Approved",
        icon: <Check className="w-3 h-3 mr-1" />,
    },
    pending: {
        color: "bg-amber-500",
        label: "Pending",
    },
    rejected: {
        color: "bg-gray-500",
        label: "Rejected",
    },
};

// Role badge configurations
const roleConfig: Record<string, { color: string }> = {
    Admin: { color: "bg-indigo-600" },
    User: { color: "bg-purple-500" },
    Moderator: { color: "bg-teal-500" },
    Guest: { color: "bg-gray-400" },
    Owner: { color: "bg-rose-600" },
};

// Color palette for generic badges
const colorPalette = [
    "bg-pink-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-lime-500",
    "bg-fuchsia-500",
    "bg-sky-500",
    "bg-yellow-500",
];

// works
// Simple hash function to get consistent color for unknown values
// const getColorForValue = (value: string): string => {
//     let hash = 0;
//     for (let i = 0; i < value.length; i++) {
//         hash = value.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return colorPalette[Math.abs(hash) % colorPalette.length];
// };

// // Custom DataViewer component
// const CustomDataViewer = <Cell extends CellBase>({
//     cell,
//     row,
//     column,
// }: DataViewerProps<Cell>) => {
//     const val = cell?.value;

//     // Skip header row (row 0)
//     if (row === 0) {
//         return (
//             <span className="font-semibold text-gray-700 dark:text-gray-200">
//                 {val}
//             </span>
//         );
//     }

//     // Status column (column 1)
//     if (column === 1 && typeof val === "string") {
//         const config = statusConfig[val.toLowerCase().replace(/\s+/g, "_")];
//         if (config) {
//             return (
//                 <Badge color={config.color}>
//                     {config.icon}
//                     {config.label}
//                 </Badge>
//             );
//         }
//         // Unknown status - render as generic badge
//         return (
//             <Badge color={getColorForValue(val)}>
//                 {val}
//             </Badge>
//         );
//     }

//     // Role column (column 2)
//     if (column === 2 && typeof val === "string") {
//         const config = roleConfig[val];
//         if (config) {
//             return (
//                 <Badge color={config.color}>
//                     {val}
//                 </Badge>
//             );
//         }
//         // Unknown role - render as generic badge
//         return (
//             <Badge color={getColorForValue(val)}>
//                 {val}
//             </Badge>
//         );
//     }

//     // Score column (column 3)
//     if (column === 3 && (typeof val === "number" || !isNaN(Number(val)))) {
//         const score = Number(val);
//         const scoreColor =
//             score >= 80
//                 ? "bg-emerald-500"
//                 : score >= 60
//                     ? "bg-amber-500"
//                     : "bg-red-500";
//         return (
//             <div className="flex items-center gap-1.5">
//                 <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
//                 <Badge color={scoreColor}>{score}</Badge>
//             </div>
//         );
//     }

//     // Action column (column 4)
//     if (column === 4 && typeof val === "string") {
//         return (
//             <button className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md">
//                 {val.charAt(0).toUpperCase() + val.slice(1)}
//             </button>
//         );
//     }

//     // Name column (column 0) - render with a colored dot
//     if (column === 0 && typeof val === "string" && val) {
//         return (
//             <div className="flex items-center gap-2">
//                 <div
//                     className="w-2 h-2 rounded-full"
//                     style={{ backgroundColor: getColorForValue(val) }}
//                 />
//                 <span className="font-medium text-gray-800 dark:text-gray-100">
//                     {val}
//                 </span>
//             </div>
//         );
//     }

//     // Default: render as text
//     if (val !== undefined && val !== null && val !== "") {
//         return (
//             <span className="text-gray-700 dark:text-gray-300">{String(val)}</span>
//         );
//     }

//     return null;
// };

// Define the cell type
type SheetCell = CellBase<string | number>;

export default function Sheets({ data, setData }: any) {
    // const [data, setData] = useState<(SheetCell | undefined)[][]>([
    //     [
    //         { value: "Name" },
    //         { value: "Status" },
    //         { value: "Role" },
    //         { value: "Score" },
    //         { value: "Action" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "Anish" },
    //         { value: "verified" },
    //         { value: "Admin" },
    //         { value: 95 },
    //         { value: "message" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "Ravi" },
    //         { value: "not_verified" },
    //         { value: "User" },
    //         { value: 60 },
    //         { value: "message" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "Priya" },
    //         { value: "approved" },
    //         { value: "Moderator" },
    //         { value: 85 },
    //         { value: "message" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "Sneha" },
    //         { value: "pending" },
    //         { value: "Guest" },
    //         { value: 45 },
    //         { value: "invite" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "Amit" },
    //         { value: "verified" },
    //         { value: "Owner" },
    //         { value: 98 },
    //         { value: "message" },
    //         { value: "" },
    //         { value: "" }
    //     ], [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },

    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    //     [
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" },
    //         { value: "" }
    //     ],
    // ]);

    return (
        <div className="flex-1 max-h-screen w-1/2 overflow-auto">
            <div className="min-w-max rounded-xl overflow-hidden">
                <Spreadsheet
                    data={data}
                    onChange={setData as (data: (CellBase | undefined)[][]) => void}
                    // DataViewer={CustomDataViewer}
                    darkMode={false}
                />
            </div>
        </div>
    );
}
