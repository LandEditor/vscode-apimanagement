/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ApiManagementModels } from "@azure/arm-apimanagement";
import {
	AzExtTreeItem,
	AzureParentTreeItem,
	ICreateChildImplContext,
} from "vscode-azureextensionui";

import { topItemCount } from "../constants";
import { localize } from "../localize";
import { processError } from "../utils/errorUtil";
import { treeUtils } from "../utils/treeUtils";
import { IServiceTreeRoot } from "./IServiceTreeRoot";
import { NamedValueTreeItem } from "./NamedValueTreeItem";

export interface INamedValuesTreeItemContext extends ICreateChildImplContext {
	key: string;

	value: string;

	secret?: boolean;
}

export class NamedValuesTreeItem extends AzureParentTreeItem<IServiceTreeRoot> {
	public get iconPath(): { light: string; dark: string } {
		return treeUtils.getThemedIconPath("list");
	}

	public static contextValue: string = "azureApiManagementNamedValues";

	public label: string = "Named values";

	public contextValue: string = NamedValuesTreeItem.contextValue;

	public readonly childTypeLabel: string = localize(
		"azureApiManagement.NamedValue",
		"Named value",
	);

	private _nextLink: string | undefined;

	public hasMoreChildrenImpl(): boolean {
		return this._nextLink !== undefined;
	}

	public async loadMoreChildrenImpl(
		clearCache: boolean,
	): Promise<AzExtTreeItem[]> {
		if (clearCache) {
			this._nextLink = undefined;
		}

		const propertyCollection: ApiManagementModels.NamedValueCollection =
			this._nextLink === undefined
				? await this.root.client.namedValue.listByService(
						this.root.resourceGroupName,
						this.root.serviceName,
						{ top: topItemCount },
					)
				: await this.root.client.namedValue.listByServiceNext(
						this._nextLink,
					);

		this._nextLink = propertyCollection.nextLink;

		return this.createTreeItemsWithErrorHandling(
			propertyCollection,
			"invalidApiManagementNamedValue",
			async (prop: ApiManagementModels.NamedValueContract) =>
				new NamedValueTreeItem(this, prop),
			(prop: ApiManagementModels.NamedValueContract) => {
				return prop.name;
			},
		);
	}

	public async createChildImpl(
		context: INamedValuesTreeItemContext,
	): Promise<NamedValueTreeItem> {
		if (context.key && context.value) {
			context.showCreatingTreeItem(context.key);

			const propertyContract = <
				ApiManagementModels.NamedValueCreateContract
			>{
				displayName: context.key,
				value: context.value,
				secret: context.secret,
			};

			try {
				const property =
					await this.root.client.namedValue.createOrUpdate(
						this.root.resourceGroupName,
						this.root.serviceName,
						context.key,
						propertyContract,
					);

				return new NamedValueTreeItem(this, property);
			} catch (error) {
				throw new Error(
					processError(
						error,
						localize(
							"createNamedValueFailed",
							`Failed to create the named value ${context.key}`,
						),
					),
				);
			}
		} else {
			throw Error(localize("", "Key and the value are expected."));
		}
	}
}
