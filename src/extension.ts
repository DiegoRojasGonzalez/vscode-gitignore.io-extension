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

                // Assume response.data is a CSV string
                const csvData: string = response.data;
                const names = csvData.split(",");
                const options: Option[] = names.map((name) => ({
                    label: name.trim(),
                }));
                return options;
            }

            // UI load ( //TODO : Refactoring needed on other folder) UI / components / features folder
            try {
                const options = await fetchOptions();

                const selectedOptions = await window.showQuickPick(options, {
                    canPickMany: true,
                    placeHolder:
                        "Select the languages/frameworks for .gitignore",
                });

                if (selectedOptions) {
                    const selectedLabels = selectedOptions.map(
                        (option) => option.label
                    );
                    window.showInformationMessage(
                        `Selected: ${selectedLabels.join(", ")}`
                    );
                } else {
                    window.showInformationMessage("No options selected");
                }
            } catch (error) {
                window.showErrorMessage(`Error: ${error}`);
            }

            //TODO : Obtain list of stack on extension
            //TODO : Post stack list on api
            //TODO : get gitignore data
            //TODO : create files with fs
            //TODO : create a unit test for mvp extension
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
