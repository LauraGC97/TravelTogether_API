import express from 'express';
import noticationsController from '../../controllers/notifications.controller.js';
import notificationsController from '../../controllers/notifications.controller.js';

const router = express.Router();

router.get('/', noticationsController.getAllNotifications);
router.get('/:id', notificationsController.getNotificationById);

router.post('/', noticationsController.createNotification);
router.put('/:id', noticationsController.updateNotificationById);
router.delete('/:id', noticationsController.deleteNotificationById);

export default router;