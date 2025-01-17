/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from "../localize";

function parseResourceId(id: string): RegExpMatchArray {
	const matches: RegExpMatchArray | null = id.match(
		/\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/(.*)\/(.*)/,
	);

	if (matches === null || matches.length < 3) {
		throw new Error(
			localize(
				"azApiManagement.InvalidResourceId",
				"Invalid Azure Resource Id",
			),
		);
	}

	return matches;
}

export function getResourceGroupFromId(id: string): string {
	return parseResourceId(id)[2];
}

export function getSubscriptionFromId(id: string): string {
	return parseResourceId(id)[1];
}

export function getNameFromId(id: string): string {
	return parseResourceId(id)[4];
}
