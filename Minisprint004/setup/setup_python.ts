import { execFileSync } from "child_process";

const script = "setup/setup_data.py";

for (const python of ["python3", "python"]) {
    try {
        execFileSync(python, [script], {
            stdio: "inherit"
        });

        process.exit(0);
    } catch (error) {
        console.log(error)
    }
}

console.error("> Python could not be found.");
console.error("> Please install Python and try again.");
process.exit(1);