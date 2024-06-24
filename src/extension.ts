import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    console.log(
        'Congratulations, your extension "gitignore-io-extension" is now active!'
    );

    const disposable = vscode.commands.registerCommand(
        "gitignore-io-extension.generate-file",
        () => {
            vscode.window.showInformationMessage(
                ".gitignore created successfully!"
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
