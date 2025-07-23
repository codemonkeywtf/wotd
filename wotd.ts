/**
 * wotd.ts
 *
 * A Deno CLI tool to display a word of the day with its definition,
 * pronunciation, and synonyms. Now loads words from external files.
 *
 * --- HOW TO USE ---
 *
 * 1. To run directly:
 * deno run --allow-net --allow-read https://deno.land/x/wotd/mod.ts
 *
 * 2. To install as a command-line utility:
 * deno install --allow-net --allow-read -n wotd https://deno.land/x/wotd/mod.ts
 * Then you can simply run: wotd
 *
 * --- HOW TO EXTEND THE WORD LIST ---
 *
 * 1. Create a directory for the configuration:
 * On Linux/macOS: mkdir -p ~/.config/wotd
 * On Windows: mkdir C:\Users\YourUser\.config\wotd
 *
 * 2. Create a file named `custom_words.json` in that directory.
 *
 * 3. Add a JSON array of your own words to this file, for example:
 * ["epistemology", "ontology", "soliloquy"]
 *
 * The tool will automatically find and merge your custom words.
 */

import {
  bold,
  cyan,
  gray,
  italic,
  magenta,
  yellow,
} from "https://deno.land/std@0.224.0/fmt/colors.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";

// --- Interfaces for API Response ---
interface Phonetic {
  text: string;
  audio?: string;
}

interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface WordEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls: string[];
}

/**
 * Loads the word lists from the default remote source and a local custom file.
 * @returns A promise that resolves to a merged list of unique words.
 */
async function loadWordList(): Promise<string[]> {
  let defaultWords: string[] = [];
  let customWords: string[] = [];

  // 1. Load the default word list from its source.
  // In a real-world scenario, this would be a remote URL.
  const defaultWordsURL = new URL("words.json", import.meta.url).href;
  try {
    const response = await fetch(defaultWordsURL);
    if (response.ok) {
        defaultWords = await response.json();
    } else {
        console.error(gray("Could not fetch default word list."));
    }
  } catch (error) {
    console.error(gray(`Error fetching default word list: ${error.message}`));
  }

  // 2. Load the custom word list from the user's config directory.
  const homeDir = Deno.env.get("HOME");
  if (homeDir) {
    const configPath = join(homeDir, ".config", "wotd");
    await ensureDir(configPath); // Ensure the directory exists
    const customWordsPath = join(configPath, "custom_words.json");
    try {
      const customContent = await Deno.readTextFile(customWordsPath);
      customWords = JSON.parse(customContent);
      if (!Array.isArray(customWords)) {
          console.error(yellow("Warning: Custom words file is not a valid JSON array. Ignoring."));
          customWords = [];
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // This is fine, the user just doesn't have a custom list yet.
      } else {
        console.error(yellow(`Warning: Could not read or parse custom_words.json. ${error.message}`));
      }
    }
  }

  // 3. Merge the lists and remove duplicates.
  const combinedList = [...new Set([...defaultWords, ...customWords])];

  if (combinedList.length === 0) {
      throw new Error("Word list is empty. Cannot select a word of the day.");
  }

  return combinedList;
}


/**
 * Gets the word of the day from a given list.
 * This function is deterministic: it will always return the same word for a given day.
 * @param wordList The list of words to choose from.
 * @returns The word of the day as a string.
 */
function getWordOfTheDay(wordList: string[]): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % wordList.length;
  return wordList[index];
}

/**
 * Fetches word data from the Free Dictionary API.
 * @param word The word to fetch data for.
 * @returns A promise that resolves to an array of WordEntry objects.
 */
async function fetchWordData(word: string): Promise<WordEntry[]> {
  const API_URL = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  const response = await fetch(API_URL);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Sorry, could not find definitions for "${word}".`);
    }
    throw new Error(`API request failed with status: ${response.status}`);
  }

  return response.json();
}

/**
 * Formats and prints the word data to the console.
 * @param data The word data fetched from the API.
 */
function displayWord(data: WordEntry[]) {
  const entry = data[0];
  if (!entry) {
    console.error(bold(yellow("No data to display.")));
    return;
  }

  const terminalWidth = Deno.consoleSize().columns;
  const contentWidth = Math.min(80, terminalWidth - 4);

  const line = "─".repeat(contentWidth);
  const topBorder = bold(gray(`┌${line}┐`));
  const bottomBorder = bold(gray(`└${line}┘`));
  const separator = bold(gray(`├${line}┤`));

  const pad = (s: string) => ` ${s.padEnd(contentWidth - 1)}`;
  const wrap = (text: string, prefix = ""): string[] => {
      const lines: string[] = [];
      const maxWidth = contentWidth - 2 - prefix.length;
      let currentLine = prefix;
      for (const word of text.split(" ")) {
          if (currentLine.length + word.length + 1 > maxWidth) {
              lines.push(pad(currentLine));
              currentLine = prefix + word;
          } else {
              currentLine += (currentLine === prefix ? "" : " ") + word;
          }
      }
      lines.push(pad(currentLine));
      return lines;
  };

  const print = (s: string) => console.log(bold(gray("│")) + s + bold(gray("│")));

  console.log(topBorder);

  // --- Word and Pronunciation ---
  const phoneticText = entry.phonetics.find(p => p.text)?.text || entry.phonetic || "";
  print(pad(bold(cyan(entry.word)) + "  " + gray(italic(phoneticText))));

  console.log(separator);

  // --- Definitions ---
  entry.meanings.forEach((meaning, index) => {
    print(pad(magenta(meaning.partOfSpeech)));
    meaning.definitions.forEach((def, defIndex) => {
      const defLines = wrap(`${defIndex + 1}. ${def.definition}`, "  ");
      defLines.forEach(line => print(line));
      if (def.example) {
        const exLines = wrap(italic(`e.g. "${def.example}"`), "    ");
        exLines.forEach(line => print(gray(line)));
      }
    });
    if (index < entry.meanings.length - 1) {
        print(pad("")); // Spacer
    }
  });

  // --- Thesaurus ---
  const synonyms = [
    ...new Set(entry.meanings.flatMap(m => m.synonyms || []).concat(entry.meanings.flatMap(m => m.definitions.flatMap(d => d.synonyms || []))))
  ];

  if (synonyms.length > 0) {
    console.log(separator);
    print(pad(bold(yellow("Thesaurus"))));
    const thesaurusLines = wrap(synonyms.join(", "), "  ");
    thesaurusLines.forEach(line => print(line));
  }

  console.log(bottomBorder);
}

/**
 * Main function to run the CLI tool.
 */
async function main() {
  try {
    const wordList = await loadWordList();
    const word = getWordOfTheDay(wordList);
    const data = await fetchWordData(word);
    displayWord(data);
  } catch (error) {
    console.error(bold(yellow(`\nError: ${error.message}\n`)));
  }
}

// --- Run the main function ---
if (import.meta.main) {
  main();
}

