import { trim, zipObj, reduce } from "ramda";

// Use export type for interfaces when isolatedModules is enabled
export interface ASSDialogueEntry {
  [key: string]: string;
}

const dialogueKeysRegex = /\[Events\][\r\n]+Format:(.*?)[\r\n]+/;
const dialogueLineRegex = /^Dialogue:/;

const getKeys = (subtitleText: string): string[] => {
  const match = subtitleText.match(dialogueKeysRegex);
  const keysLine = match ? match[1] : null;
  if (!keysLine) throw new Error("Failed to parse keys in .ass file");

  const keys = keysLine.split(",").map(trim);
  return keys;
};

const isDialogueLine = (line: string): boolean => dialogueLineRegex.test(line);

const ASStoJSON = (subtitleText: string): ASSDialogueEntry[] => {
  // Standardizing line breaks from all OS -  MAC: '\r', UNIX: '\n', WIN '\r\n'
  subtitleText = subtitleText.replace(/(\r\n|\r)/g, "\n");

  // split file by line
  const lines = subtitleText.split(/\n/);

  // get the keys of the dialogue lines
  const keys = getKeys(subtitleText);

  const zipDialogueReducer = (acc: ASSDialogueEntry[], line: string): ASSDialogueEntry[] => {
    if (!isDialogueLine(line)) return acc;

    // Remove the "Dialogue: " prefix
    const dialogueContent = line.replace(/^Dialogue:\s*/, "");

    // Split the content into fields, properly handling text with commas
    let values: string[] = [];
    let currentField = "";
    let inText = false;
    let fieldCount = 0;

    // Parse the fields manually to handle commas in the Text field
    for (let i = 0; i < dialogueContent.length; i++) {
      const char = dialogueContent[i];

      if (char === "," && !inText && fieldCount < keys.length - 1) {
        values.push(currentField.trim());
        currentField = "";
        fieldCount++;
      } else {
        currentField += char;

        // Once we've processed the expected number of fields before Text,
        // we're in the Text field (which may contain commas)
        if (fieldCount >= keys.length - 1) {
          inText = true;
        }
      }
    }

    // Add the last field (Text)
    if (currentField) {
      values.push(currentField.trim());
    }

    // Handle \N as newlines in the text
    if (values[values.length - 1]) {
      values[values.length - 1] = values[values.length - 1].replace(/\\N/g, "\n");
    }

    // Make sure we have the right number of values
    while (values.length < keys.length) {
      values.push("");
    }

    // Create an object from the keys and values
    const obj = zipObj(keys, values) as ASSDialogueEntry;
    return acc.concat(obj);
  };

  const parsed = reduce(zipDialogueReducer, [] as ASSDialogueEntry[], lines);
  return parsed;
};

export default ASStoJSON;
