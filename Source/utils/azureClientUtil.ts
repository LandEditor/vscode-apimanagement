/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { WebSiteManagementClient } from "@azure/arm-appservice";
import { Environment } from "@azure/ms-rest-azure-env";
import { TokenCredentialsBase } from "@azure/ms-rest-nodeauth";
import * as vscode from "vscode";
import { createAzureClient } from "vscode-azureextensionui";

import { IAzureClientInfo } from "../azure/azureClientInfo";
import { ext } from "../extensionVariables";
import { localize } from "../localize";

export namespace azureClientUtil {
	export function getClient(
		credentials: TokenCredentialsBase,
		subscriptionId: string,
		environment: Environment,
	): WebSiteManagementClient {
		const clientInfo: IAzureClientInfo = {
			credentials: credentials,
			subscriptionId: subscriptionId,
			environment: environment,
		};

		return createAzureClient(clientInfo, WebSiteManagementClient);
	}

	// tslint:disable: no-unsafe-any
	export async function selectSubscription(): Promise<string> {
		const azureAccountExtension = vscode.extensions.getExtension(
			"ms-vscode.azure-account",
		);
		// tslint:disable-next-line: no-non-null-assertion
		const azureAccount = azureAccountExtension!.exports;

		await azureAccount.waitForFilters();

		if (azureAccount.status !== "LoggedIn") {
			throw new Error(localize("", "Please Log in at first!"));
		}

		const subscriptions: { id: string; name: string }[] =
			azureAccount.filters.map((filter) => {
				return {
					id: filter.subscription.subscriptionId,
					name: filter.subscription.displayName,
				};
			});

		const subscriptionId = await ext.ui.showQuickPick(
			subscriptions.map((s) => {
				const option = s.id.concat(" (", s.name, ")");

				return { label: option, subscriptionId: s.id };
			}),
			{
				canPickMany: false,
				placeHolder: localize(
					"",
					"Please choose the Azure subscription",
				),
			},
		);

		return subscriptionId.subscriptionId;
	}
}
