import { window, commands, ExtensionContext, workspace, Uri } from "vscode";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

export function activate(context: ExtensionContext) {
    console.log(
        'Congratulations, your extension "gitignore-io-extension" is now active!'
    );

    const disposable = commands.registerCommand(
        "gitignore-io-extension.generate-file",
        async (uri: Uri) => {
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
                if (fs.existsSync(".gitignore")) {
                    window.showErrorMessage(
                        "An .gitignore file already exists in this workspace"
                    );
                    return;
                }

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

                    window.showInformationMessage(
                        `Selected: ${selectedLabels.join(", ")}`
                    );

                    //! API CALL FOR GITIGNORE
                    const gitignoreContent = await fetchGitignore(
                        selectedLabels
                    );

                    // Obtén la ruta actual del espacio de trabajo o la carpeta seleccionada
                    let folderPath: string;
                    if (uri && uri.fsPath) {
                        folderPath = uri.fsPath;
                    } else {
                        const workspaceFolders = workspace.workspaceFolders;
                        if (!workspaceFolders) {
                            window.showErrorMessage(
                                "No workspace folder is open"
                            );
                            return;
                        }
                        folderPath = workspaceFolders[0].uri.fsPath;
                    }
                    const fileName = ".gitignore";
                    const filePath = path.join(folderPath, fileName);

                    // Crea el archivo en la ruta seleccionada
                    fs.writeFile(filePath, gitignoreContent, (err) => {
                        if (err) {
                            window.showInformationMessage(
                                "Error creating file: " + err
                            );
                        } else {
                            window.showInformationMessage(
                                fileName +
                                    " created successfully at " +
                                    filePath
                            );
                        }
                    });
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
