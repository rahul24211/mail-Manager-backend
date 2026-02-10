import Notifications from "../module/notification.model.js";

export const createNotification = async ({ to, from, tital, subject,requestId }) => {
  if (!to || !from) {
    return;
  }

  const notification = await Notifications.create({
    to,
    from,
    tital,
    subject,
    requestId
  });

  return notification;
};
