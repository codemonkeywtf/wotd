# wotd - Word of the Day CLI

![wotd banner](https://placehold.co/1200x300/202A3A/5299E0?text=wotd&font=roboto)

A simple, elegant, and extendable command-line tool for displaying a word of the day, built with Deno.

This CLI tool fetches and displays a new word each day, complete with its definition, pronunciation, and a brief thesaurus. The output is beautifully formatted for your terminal, and the word list is fully extendable with your own custom words.

---

### Demo

Here's what you can expect to see when you run `wotd`:

```

┌───────────────────────────────────────────────────────────────────────────────┐
│ erudite  /ˈɛr(j)ʊdaɪt/                                                          │
├───────────────────────────────────────────────────────────────────────────────┤
│ adjective                                                                     │
│   1. having or showing great knowledge or learning.                             │
│     e.g. "Ken could turn any conversation into an erudite discussion"           │
├───────────────────────────────────────────────────────────────────────────────┤
│ Thesaurus                                                                     │
│   learned, scholarly, educated, knowledgeable, well-read, well-informed,      │
│   intellectual, intelligent, clever, academic, literary, bookish,             │
│   scholastic, cerebral                                                        │
└───────────────────────────────────────────────────────────────────────────────┘

````

## Features

* **Daily Word**: Get a new, interesting word every single day.
* **Rich Details**: Includes definitions, parts of speech, phonetic pronunciation, and synonyms.
* **Beautiful Output**: Clean, modern, and responsive layout that looks great in any terminal.
* **Extendable**: Easily add your own words to the list by creating a simple JSON file.
* **Lightweight**: Built with Deno, it's a single script with no heavy dependencies.

## Installation

This tool is built for [Deno](https://deno.com/).

To install the `wotd` command globally on your system, run the following command in your terminal. This assumes the module is published to `deno.land/x`.

```bash
deno install --allow-net --allow-read -n wotd [https://deno.land/x/wotd/wotd.ts](https://deno.land/x/wotd/wotd.ts)
````

This will install the script as an executable named `wotd`. Make sure your Deno `bin` directory is in your system's `PATH`.

## Usage

Once installed, simply run the command:

```bash
wotd
```

## Extending the Word List

Want to see your own words appear in the daily rotation? You can easily add a custom word list.

1.  **Create the configuration directory.**

      * On Linux or macOS:
        ```bash
        mkdir -p ~/.config/wotd
        ```
      * On Windows (in PowerShell):
        ```powershell
        New-Item -Path $HOME\.config\wotd -ItemType Directory -Force
        ```

2.  **Create a `custom_words.json` file** inside the `~/.config/wotd/` directory.

3.  **Add your words** to the file as a JSON array. For example:

    **`~/.config/wotd/custom_words.json`**

    ```json
    [
      "epistemology",
      "ontology",
      "soliloquy",
      "weltanschauung"
    ]
    ```

The `wotd` tool will automatically discover this file, merge it with the default list, and include your words in the daily selection pool.

## Development

If you'd like to run the tool from source or contribute to its development:

1.  Clone the repository:

    ```bash
    git clone [https://github.com/codemonkeywtf/wotd.git](https://github.com/codemonkeywtf/wotd.git)
    cd wotd
    ```

2.  Run the main script directly:

    ```bash
    deno run --allow-net --allow-read wotd.ts
    ```

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
