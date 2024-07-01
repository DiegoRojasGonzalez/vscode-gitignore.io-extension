import { window, commands, ExtensionContext } from "vscode";
import axios from "axios";

export function activate(context: ExtensionContext) {
    console.log(
        'Congratulations, your extension "gitignore-io-extension" is now active!'
    );

    const disposable = commands.registerCommand(
        "gitignore-io-extension.generate-file",
        async () => {
            //Interface ( //TODO : Refactoring needed on other folder) - Interfaces folder
            interface Option {
                label: string;
            }

            // Helper or Https module //TODO : Refactoring needed on other folder - helpers and https
            async function fetchOptions(): Promise<Option[]> {
                const response = await axios.get(
                    `https://www.toptal.com/developers/gitignore/api/list`
                );

                if (response.status !== 200) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                // Assume response.data is a CSV string //TODO : create helper for this
                const csvData: string = response.data;
                const names = csvData.split(",");
                const options: Option[] = names.map((name) => ({
                    label: name.trim(),
                }));
                return options;
            }

            // FETCH GITIGNORE DATA ( //TODO : Refactoring needed on other folder)
            async function fetchGitignore(
                selectedLabels: string[]
            ): Promise<string> {
                const response = await axios.get(
                    `https://www.toptal.com/developers/gitignore/api/${selectedLabels.join(
                        ","
                    )}`
                );

                if (response.status !== 200) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                return response.data;
            }

            // UI load ( //TODO : Refactoring needed on other folder) UI / components / features folder
            try {
                //! API CALL FOR OPTIONS
                const options = await fetchOptions();

                //? UI SELECTION
                const selectedOptions = await window.showQuickPick(options, {
                    canPickMany: true,
                    placeHolder:
                        "Select the languages/frameworks for .gitignore",
                });

                if (selectedOptions) {
                    const selectedLabels = selectedOptions.map(
                        (option) => option.label
                    );

                    //! API CALL FOR GITIGNORE
                    const gitignoreContent = await fetchGitignore(
                        selectedLabels
                    );

                    window.showInformationMessage(gitignoreContent);

                    console.log(gitignoreContent);
                } else {
                    window.showInformationMessage("No options selected");
                }
            } catch (error) {
                window.showErrorMessage(`Error: ${error}`);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}

// // TODO : Obtain list of stack on extension
// // TODO : Post stack list on api
// // TODO : get gitignore data
//TODO : create files with fs
//TODO : create a unit test for mvp extension
