/**
 *  Copyright (C) 2018 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { NotificationEvents } from "./notification.events";
import { NotificationsChannel } from "./notifications.channel";

export class NotificationRisksEvents extends NotificationEvents {
	private comments: { [id: string]: NotificationEvents};

	constructor(protected channel: NotificationsChannel) {
		super(channel, "risk");
		this.comments = {};
	}

	public getCommentsNotifications(id: string): NotificationEvents {
		if (!this.comments[id]) {
			this.comments[id] =  new NotificationEvents(this.channel, "comment", id);
		}

		return this.comments[id];
	}

}