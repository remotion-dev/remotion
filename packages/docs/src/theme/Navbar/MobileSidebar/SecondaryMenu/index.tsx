/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarSecondaryMenu} from '@docusaurus/theme-common/internal';
import Translate from '@docusaurus/Translate';
import React, {type ReactNode} from 'react';

export default function NavbarMobileSidebarSecondaryMenu(): ReactNode {
	const isPrimaryMenuEmpty = useThemeConfig().navbar.items.length === 0;
	const secondaryMenu = useNavbarSecondaryMenu();

	return (
		<>
			{!isPrimaryMenuEmpty && (
				<button
					className="clean-btn navbar-sidebar__back"
					onClick={() => secondaryMenu.hide()}
					type="button"
				>
					<Translate
						id="theme.navbar.mobileSidebarSecondaryMenu.backButtonText"
						description="The label of the button to return from the docs sidebar to the main mobile menu, without the back arrow"
					>
						Back to main menu
					</Translate>
				</button>
			)}
			{secondaryMenu.content}
		</>
	);
}
