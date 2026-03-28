import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        const { command, cwd } = await req.json();

        if (!command) {
            return NextResponse.json({ error: "No command provided" }, { status: 400 });
        }

        // We use a trick to track CWD: 
        // Run the command, then print the current directory.
        // On Windows, use '& cd'. On Linux/macOS, use '; pwd'.
        const isWindows = process.platform === "win32";
        const pwdCommand = isWindows ? "cd" : "pwd";
        
        // Construct a command that runs the user input AND then prints the directory
        // We wrap it in quotes or use && to ensure we get the dir after a potential 'cd'
        const fullCommand = `${command} ${isWindows ? "&" : ";"} ${pwdCommand}`;

        console.log(`[Terminal] Executing in ${cwd || "root"}: ${fullCommand}`);
        
        try {
            const { stdout, stderr } = await execAsync(fullCommand, { 
                cwd: cwd || process.cwd(),
                shell: isWindows ? "cmd.exe" : "/bin/bash"
            });

            // Parse the output. The last line (after our PWD command) is the new CWD.
            const lines = stdout.trim().split(/\r?\n/);
            const newCwd = lines.pop()?.trim() || cwd || process.cwd();
            const actualStdout = lines.join("\n");

            return NextResponse.json({ 
                stdout: actualStdout, 
                stderr: stderr || "",
                cwd: newCwd
            });
        } catch (execError: any) {
             // Even if it errors, we might want to know the CWD if it was a 'cd' that failed
             // But usually, an error means the command failed.
             return NextResponse.json({ 
                stdout: execError.stdout || "", 
                stderr: execError.stderr || execError.message || "Execution error",
                cwd: cwd || process.cwd(),
                error: true
            });
        }

    } catch (error: any) {
        console.error("[Terminal] Internal error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}
