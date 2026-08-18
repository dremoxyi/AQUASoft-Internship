import { createReadStream, type PathLike } from "node:fs";
import { createInterface } from "node:readline";
type CsvRow = Record<string, string>;


export function normalizeValue(value: string | undefined): string {
	return (value ?? "").trim();
}

export function toNumber(value: string | undefined): number | null {
	const normalized = normalizeValue(value);

	if (!normalized) {
		return null;
	}

	const parsed = Number(normalized);

	return Number.isFinite(parsed)
		? parsed
		: null;
}


export async function readCsvRows(dataPath:string): Promise<{
    headers: string[];
    rows: CsvRow[];
}> {

    const stream = createReadStream(
        dataPath,
        { encoding: "utf8" }
    );

    const reader = createInterface({
        input: stream,
        crlfDelay: Infinity
    });

    const rows: CsvRow[] = [];

    let headers: string[] = [];

    for await (const rawLine of reader) {

        const line = rawLine.replace(/\r$/, "");

        if (!line.trim()) {
            continue;
        }

        if (headers.length === 0) {
            headers = parseCsvLine(line);
            continue;
        }

        const values = parseCsvLine(line);

        const row: CsvRow = {};

        for (
            let i = 0;
            i < headers.length;
            i += 1
        ) {

            const header = headers[i];

            if (!header) {
                continue;
            }

            row[header] = values[i] ?? "";
        }

        rows.push(row);
    }

    reader.close();
    stream.close();

    return {
        headers,
        rows
    };
}

export function parseCsvLine(line: string): string[] {
	const values: string[] = [];

	let current = "";
	let insideQuotes = false;

	for (let i = 0; i < line.length; i += 1) {
		const character = line[i];

		if (character === '"') {
			if (insideQuotes && line[i + 1] === '"') {
				current += '"';
				i += 1;
			} else {
				insideQuotes = !insideQuotes;
			}

			continue;
		}

		if (character === "," && !insideQuotes) {
			values.push(current);
			current = "";
			continue;
		}

		current += character;
	}

	values.push(current);

	return values;
}
